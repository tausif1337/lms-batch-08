"""Drive every API endpoint against a running server and report what happened.

    python manage.py runserver 8001          # in one terminal
    python scripts/api_smoke_test.py         # in another

This is not a unit test suite: it talks HTTP to a real server with a real
database, which is the only way to catch the things that only go wrong there —
a permission class wired to the wrong view, a serializer that rejects its own
output, a route that was never added to urls.py.

Every check states the status code it expects. A check that expects 403 is
just as much a pass as one that expects 200: the permission rules are part of
what "working" means here, so a create that succeeds when it should have been
refused is a failure.

Anything this script creates, it deletes again on the way out.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests

BASE = os.environ.get("LMS_API", "http://127.0.0.1:8001/api")

ACCOUNTS = {
    "admin": ("01700000000", "admin1234"),
    "teacher": ("01700000001", "teacher1234"),
    "student": ("01700000002", "student1234"),
}

GREEN, RED, YELLOW, DIM, RESET = "\033[32m", "\033[31m", "\033[33m", "\033[2m", "\033[0m"


class Report:
    def __init__(self):
        self.passed = 0
        self.failures = []
        self.section = ""

    def heading(self, text):
        self.section = text
        print(f"\n{text}\n{'-' * len(text)}")

    def check(self, label, response, expected):
        """`expected` is a status code or a tuple of acceptable ones."""
        wanted = expected if isinstance(expected, tuple) else (expected,)
        got = response.status_code
        if got in wanted:
            self.passed += 1
            print(f"  {GREEN}pass{RESET} {label} {DIM}[{got}]{RESET}")
            return True

        detail = response.text[:200].replace("\n", " ")
        self.failures.append((self.section, label, wanted, got, detail))
        print(f"  {RED}FAIL{RESET} {label} {DIM}[expected {'/'.join(map(str, wanted))}, got {got}]{RESET}")
        print(f"       {DIM}{detail}{RESET}")
        return False

    def note(self, text):
        print(f"  {YELLOW}note{RESET} {text}")

    def summary(self):
        print("\n" + "=" * 62)
        total = self.passed + len(self.failures)
        if not self.failures:
            print(f"{GREEN}All {total} checks passed.{RESET}")
            return 0
        print(f"{RED}{len(self.failures)} of {total} checks failed:{RESET}")
        for section, label, wanted, got, detail in self.failures:
            print(f"  - [{section}] {label}: expected {'/'.join(map(str, wanted))}, got {got}")
            print(f"    {DIM}{detail}{RESET}")
        return 1


report = Report()


class Client:
    """A signed-in caller. `anon` is the same thing without a token."""

    def __init__(self, role=None):
        self.role = role or "anon"
        self.session = requests.Session()
        self.user_id = None
        if role:
            phone, password = ACCOUNTS[role]
            body = self._raw("POST", "/login/", {"phone": phone, "password": password})
            body.raise_for_status()
            data = body.json()
            self.user_id = data["user_id"]
            self.session.headers["Authorization"] = f"Bearer {data['tokens']['access']}"
            assert data["role"] == role, f"logged in as {role}, server says {data['role']}"

    def _raw(self, method, path, payload=None):
        return self.session.request(
            method, BASE + path,
            json=payload,
            headers={"Content-Type": "application/json"} if payload is not None else None,
            timeout=20,
        )

    def get(self, path):
        return self._raw("GET", path)

    def post(self, path, payload):
        return self._raw("POST", path, payload)

    def patch(self, path, payload):
        return self._raw("PATCH", path, payload)

    def put(self, path, payload):
        return self._raw("PUT", path, payload)

    def delete(self, path):
        return self._raw("DELETE", path)


def in_days(n):
    return (datetime.now(timezone.utc) + timedelta(days=n)).isoformat()


def first_id(client, path):
    body = client.get(path).json()
    rows = body["results"] if isinstance(body, dict) and "results" in body else body
    return rows[0]["id"] if rows else None


# --------------------------------------------------------------------------

def check_login(clients):
    report.heading("Authentication")

    for role in ACCOUNTS:
        phone, password = ACCOUNTS[role]
        r = requests.post(f"{BASE}/login/", json={"phone": phone, "password": password}, timeout=20)
        if not report.check(f"log in as {role}", r, 200):
            continue

        payload = r.json()
        tokens = payload.get("tokens") or {}
        if tokens.get("access") and tokens.get("refresh") and payload.get("role") == role:
            report.passed += 1
            print(f"  {GREEN}pass{RESET} {role} gets both tokens and the right role")
        else:
            report.failures.append(("Authentication", f"{role} login payload",
                                    (200,), r.status_code, json.dumps(payload)[:200]))

    report.check("wrong password refused",
                 requests.post(f"{BASE}/login/", json={"phone": ACCOUNTS['admin'][0], "password": "nope"}, timeout=20), 400)
    report.check("unknown phone refused",
                 requests.post(f"{BASE}/login/", json={"phone": "00000000000", "password": "x"}, timeout=20), 400)
    report.check("missing field refused",
                 requests.post(f"{BASE}/login/", json={"phone": "x"}, timeout=20), 400)
    report.check("garbage token rejected",
                 requests.get(f"{BASE}/course/", headers={"Authorization": "Bearer not-a-token"}, timeout=20), 401)


def check_profile(clients):
    report.heading("Own profile")

    for role, client in clients.items():
        if role == "anon":
            continue
        r = client.get("/profile/")
        report.check(f"{role} reads own profile", r, 200)
        if r.status_code == 200:
            user = r.json()["user"]
            if user["role"] != role:
                report.failures.append(("Own profile", f"{role} sees own role",
                                        (200,), 200, f"role came back as {user['role']}"))
            else:
                report.passed += 1
                print(f"  {GREEN}pass{RESET} {role} sees own role {DIM}[{user['role']}]{RESET}")

    report.check("anonymous cannot read a profile", clients["anon"].get("/profile/"), 401)

    admin = clients["admin"]
    original = admin.get("/profile/").json()["user"]
    report.check("admin edits own name",
                 admin.patch("/profile/", {"first_name": "Smoke", "last_name": "Test"}), 200)
    report.check("admin restores own name",
                 admin.patch("/profile/", {"first_name": original["first_name"],
                                           "last_name": original["last_name"]}), 200)

    # role is deliberately not an accepted field, so sending it must not work.
    admin.patch("/profile/", {"role": "student"})
    still = admin.get("/profile/").json()["user"]["role"]
    if still == "admin":
        report.passed += 1
        print(f"  {GREEN}pass{RESET} role cannot be changed through the profile endpoint")
    else:
        report.failures.append(("Own profile", "role is not self-editable",
                                (200,), 200, f"role became {still}"))

    # Taking a phone number that already belongs to somebody else must fail.
    report.check("duplicate phone refused",
                 admin.patch("/profile/", {"phone": ACCOUNTS["teacher"][0]}), 400)

    report.check("wrong current password refused",
                 admin.post("/change-password/", {"current_password": "wrong",
                                                  "new_password": "Str0ng-Pass-9",
                                                  "confirm_password": "Str0ng-Pass-9"}), 400)
    report.check("mismatched new passwords refused",
                 admin.post("/change-password/", {"current_password": ACCOUNTS["admin"][1],
                                                  "new_password": "Str0ng-Pass-9",
                                                  "confirm_password": "Different-9"}), 400)
    report.check("weak new password refused",
                 admin.post("/change-password/", {"current_password": ACCOUNTS["admin"][1],
                                                  "new_password": "12345678",
                                                  "confirm_password": "12345678"}), 400)


def check_password_reset():
    report.heading("Password reset")

    report.check("reset request for a real address accepted",
                 requests.post(f"{BASE}/password-reset/",
                               json={"email": "demo.admin@ostad.example.com"}, timeout=20), 200)
    report.check("reset request for an unknown address gives the same answer",
                 requests.post(f"{BASE}/password-reset/",
                               json={"email": "nobody@example.com"}, timeout=20), 200)
    report.check("malformed address refused",
                 requests.post(f"{BASE}/password-reset/", json={"email": "not-an-email"}, timeout=20), 400)
    report.check("forged reset token refused",
                 requests.post(f"{BASE}/password-reset-confirm/",
                               json={"uid": "MQ", "token": "fake-token",
                                     "new_password": "Str0ng-Pass-9",
                                     "confirm_password": "Str0ng-Pass-9"}, timeout=20), 400)
    report.note("reset emails go to the console backend; check the runserver output to see one")


def check_registration(clients):
    report.heading("Account creation (admin only)")

    report.check("anonymous cannot register", clients["anon"].post("/register/", {}), 401)
    report.check("teacher cannot register", clients["teacher"].post("/register/", {}), 403)
    report.check("student cannot register", clients["student"].post("/register/", {}), 403)

    stamp = datetime.now().strftime("%H%M%S%f")
    payload = {
        "username": f"smoke_{stamp}",
        "email": f"smoke_{stamp}@example.com",
        "password": "Str0ng-Pass-9",
        "phone": f"0199{stamp[:7]}",
        "first_name": "Smoke",
        "last_name": "Check",
        "role": "teacher",
    }
    r = clients["admin"].post("/register/", payload)
    report.check("admin creates an account", r, 201)
    created_id = r.json().get("id") if r.status_code == 201 else None

    if created_id:
        if r.json().get("role") == "teacher":
            report.passed += 1
            print(f"  {GREEN}pass{RESET} chosen role was applied {DIM}[teacher]{RESET}")
        else:
            report.failures.append(("Account creation", "chosen role applied",
                                    (201,), 201, json.dumps(r.json())[:200]))

        report.check("duplicate username refused", clients["admin"].post("/register/", payload), 400)
        report.check("weak password refused", clients["admin"].post("/register/", {
            **payload, "username": f"smoke2_{stamp}", "email": f"s2_{stamp}@example.com",
            "phone": f"0198{stamp[:7]}", "password": "12345678",
        }), 400)

        # The new account has to be able to log in with what was set.
        r2 = requests.post(f"{BASE}/login/", json={"phone": payload["phone"],
                                                   "password": payload["password"]}, timeout=20)
        report.check("new account can log in", r2, 200)

    return created_id


# Resource, sample payload, and who is allowed to write it.
def resource_matrix(ids):
    stamp = datetime.now().strftime("%H%M%S")
    return [
        {
            "name": "teacher", "path": "/teacher/",
            "writers": {"admin"},
            "create": {"name": f"Smoke Teacher {stamp}", "email": f"st{stamp}@example.com",
                       "subject": "Smoke Testing", "is_active": True},
            "update": {"subject": "Smoke Testing (edited)"},
        },
        {
            "name": "student", "path": "/student/",
            "writers": {"admin"},
            "create": {"name": f"Smoke Student {stamp}", "email": f"ss{stamp}@example.com",
                       "enrollment_date": "2026-01-15", "is_active": True,
                       "roll_number": f"SMOKE-{stamp}"},
            "update": {"is_active": False},
        },
        {
            "name": "course", "path": "/course/",
            "writers": {"admin", "teacher"},
            "create": {"title": f"Smoke Course {stamp}", "description": "Created by the smoke test.",
                       "teacher": ids["teacher"]},
            "update": {"description": "Edited by the smoke test."},
        },
        {
            "name": "lesson", "path": "/lesson/",
            "writers": {"admin", "teacher"},
            "create": {"title": f"Smoke Lesson {stamp}", "description": "Created by the smoke test.",
                       "course": ids["course"]},
            "update": {"title": f"Smoke Lesson {stamp} (edited)"},
        },
        {
            "name": "assignment", "path": "/assignment/",
            "writers": {"admin", "teacher"},
            "create": {"title": f"Smoke Assignment {stamp}", "description": "Created by the smoke test.",
                       "lesson": ids["lesson"], "course": ids["course"], "due_date": in_days(7)},
            "update": {"due_date": in_days(14)},
        },
        {
            "name": "enrollment", "path": "/enrollment/",
            "writers": {"admin", "teacher"},
            "create": {"student": ids["student"], "course": ids["course"]},
            "update": {"course": ids["course"]},
        },
        {
            "name": "submission", "path": "/submission/",
            # A student may hand work in, but not edit or delete it.
            "writers": {"admin", "teacher"},
            "creators": {"admin", "teacher", "student"},
            "create": {"assignment": ids["assignment"], "student": ids["student"],
                       "content": "Handed in by the smoke test."},
            "update": {"content": "Edited by the smoke test."},
        },
        {
            "name": "results", "path": "/results/",
            "writers": {"admin", "teacher"},
            # Resolved when the row is actually posted: the submission it
            # grades is created earlier in the same loop.
            "create": {"submission": "$submission", "score": 88.5,
                       "feedback": "Graded by the smoke test."},
            "update": {"score": 91.0},
        },
    ]


def check_reads(clients):
    report.heading("Reading (every signed-in role, every list)")

    paths = ["/teacher/", "/student/", "/course/", "/enrollment/",
             "/lesson/", "/assignment/", "/submission/", "/results/"]

    for path in paths:
        report.check(f"anonymous blocked from {path}", clients["anon"].get(path), 401)

    for role in ("admin", "teacher", "student"):
        for path in paths:
            r = clients[role].get(path)
            ok = report.check(f"{role} lists {path}", r, 200)
            if ok and not isinstance(r.json(), (list, dict)):
                report.failures.append(("Reading", f"{role} {path} shape",
                                        (200,), 200, "response was not JSON list or object"))

    # Detail routes have their own permission class; check one of each.
    for path in paths:
        row_id = first_id(clients["admin"], path)
        if row_id is None:
            report.note(f"{path} is empty, skipping its detail route")
            continue
        report.check(f"student reads {path}{row_id}/", clients["student"].get(f"{path}{row_id}/"), 200)
        report.check(f"missing row on {path} gives 404",
                     clients["admin"].get(f"{path}99999999/"), 404)


def check_writes(clients):
    report.heading("Writing (create, update, delete, and who may)")

    # Real ids to hang the new rows off, taken from the seeded data.
    ids = {
        "teacher": first_id(clients["admin"], "/teacher/"),
        "student": first_id(clients["admin"], "/student/"),
        "course": first_id(clients["admin"], "/course/"),
        "lesson": first_id(clients["admin"], "/lesson/"),
        "assignment": first_id(clients["admin"], "/assignment/"),
        "submission": None,
    }

    def resolve(payload):
        """Swap any "$name" placeholder for the id it stands for."""
        return {
            key: ids[value[1:]] if isinstance(value, str) and value.startswith("$") else value
            for key, value in payload.items()
        }
    if None in (ids["teacher"], ids["student"], ids["course"], ids["lesson"], ids["assignment"]):
        report.note("not enough seeded data to run write checks")
        return []

    created = []  # (path, id) to clean up afterwards

    for spec in resource_matrix(ids):
        path, name = spec["path"], spec["name"]
        creators = spec.get("creators", spec["writers"])

        # Anonymous first: no write should ever get through without a token.
        report.check(f"anonymous cannot create a {name}", clients["anon"].post(path, resolve(spec["create"])), 401)

        # Roles that must be refused.
        for role in ("admin", "teacher", "student"):
            if role in creators:
                continue
            report.check(f"{role} cannot create a {name}", clients[role].post(path, resolve(spec["create"])), 403)

        # The role with the least privilege that is still allowed does the
        # create, so the permission class is exercised at its boundary.
        creator = "student" if "student" in creators else ("teacher" if "teacher" in creators else "admin")
        r = clients[creator].post(path, resolve(spec["create"]))
        if not report.check(f"{creator} creates a {name}", r, 201):
            continue

        row_id = r.json()["id"]
        created.append((path, row_id))
        if name == "submission":
            # Grading needs a submission id that exists.
            ids["submission"] = row_id

        detail = f"{path}{row_id}/"
        report.check(f"{name} can be read back", clients["admin"].get(detail), 200)
        report.check(f"{name} accepts PATCH", clients["admin"].patch(detail, spec["update"]), 200)
        report.check(f"{name} accepts PUT",
                     clients["admin"].put(detail, {**resolve(spec["create"]), **spec["update"]}), 200)

        for role in ("admin", "teacher", "student"):
            if role in spec["writers"]:
                continue
            report.check(f"{role} cannot edit a {name}", clients[role].patch(detail, spec["update"]), 403)
            report.check(f"{role} cannot delete a {name}", clients[role].delete(detail), 403)

        report.check(f"{name} rejects nonsense input", clients["admin"].post(path, {"title": ""}), 400)

    return created


def cleanup(clients, created, extra_user_id):
    report.heading("Cleanup")

    # Children first: a course cannot go while a lesson still points at it.
    for path, row_id in reversed(created):
        r = clients["admin"].delete(f"{path}{row_id}/")
        report.check(f"deleted {path}{row_id}/", r, (204, 404))

    if extra_user_id:
        report.note(f"account #{extra_user_id} created by the registration check is still there "
                    f"(the API has no delete-user route); remove it from /admin/ if it bothers you")


def main():
    print(f"Target: {BASE}")
    try:
        requests.get(f"{BASE}/login/", timeout=5)
    except requests.exceptions.RequestException as exc:
        print(f"{RED}Cannot reach the API at {BASE}: {exc}{RESET}")
        print("Start it with:  python manage.py runserver 8001")
        return 2

    try:
        clients = {
            "anon": Client(),
            "admin": Client("admin"),
            "teacher": Client("teacher"),
            "student": Client("student"),
        }
    except Exception as exc:
        print(f"{RED}Could not sign in: {exc}{RESET}")
        print("Run `python manage.py seed_data` first — it creates the demo accounts.")
        return 2

    check_login(clients)
    check_profile(clients)
    check_password_reset()
    extra_user_id = check_registration(clients)
    check_reads(clients)
    created = check_writes(clients)
    cleanup(clients, created, extra_user_id)

    return report.summary()


if __name__ == "__main__":
    sys.exit(main())
