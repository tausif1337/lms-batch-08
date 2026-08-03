# LMS

A small Learning Management System. Django REST API on the back, React on the front.

```
lms/
  backend/    Django + Django REST Framework + MySQL
  frontend/   Vite + React + Tailwind + lucide-react
```

---

## Running it

You need **three** things up: MySQL, the Django server, and the Vite dev server.

### 1. MySQL

The backend talks to a MySQL/MariaDB database called `lms_db`. Start your server, then create the database and user once:

```sql
CREATE DATABASE lms_db;
CREATE USER 'lms_user'@'127.0.0.1' IDENTIFIED BY 'lms_user_pw';
GRANT ALL PRIVILEGES ON lms_db.* TO 'lms_user'@'127.0.0.1';
```

To use different credentials, set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, or `DB_PORT` as environment variables.

The `backend/db.sqlite3` file in this repo is left over from an earlier setup and is not used by anything.

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

Runs on **http://127.0.0.1:8000**.

If `runserver` dies with `pywatchman.SocketTimeout: timed out waiting for response`, Django's auto-reloader is trying to use Watchman and Watchman is not answering. Start it with `python manage.py runserver --noreload` (you then have to restart it yourself after editing Python files), or raise the timeout with `DJANGO_WATCHMAN_TIMEOUT=20`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5180** (`frontend/vite.config.js` picks that port to stay clear of other projects on 5173–5175).

The port matters. The backend's CORS whitelist in `backend/lms/settings.py` lists 5180 and 5173 only. If Vite reports a different port because 5180 was busy, add that port there too or every API call will be blocked by the browser.

The frontend talks to `http://127.0.0.1:8000/api` by default. Set `VITE_API_URL` to point it somewhere else.

---

## Logging in

**You log in with a phone number, not a username and not an email.** That is how the backend is built: it looks you up through `Profile.phone`.

**There is no public sign-up.** An admin creates accounts on the **Accounts** page at http://localhost:5180/accounts, picking the role as they go. `/api/register/` returns 401 to anonymous callers and 403 to a signed-in teacher or student, so the old trick of posting to it directly does not work either. Visiting `/register` now just redirects to the login page.

If you have no admin to start from — a fresh database, say — `python manage.py createsuperuser` still works and a superuser counts as an admin. Log in with that account and make the others from the Accounts page.

---

## Roles

Every account carries a role on its `Profile`: **admin**, **teacher** or **student**.

The admin who creates an account chooses its role; leaving the field out makes a student. To change someone's role later, open http://127.0.0.1:8000/admin/backend/profile/, change it in the list, and save. Accounts that existed before roles were added were all made admins by migration `0004`, so nobody was locked out.

| | accounts | teacher & student records | course, lesson, assignment | enrollment | submission | results |
|---|---|---|---|---|---|---|
| **admin** | create | full | full | full | full | full |
| **teacher** | — | read | full | full | full | full |
| **student** | — | read | read | read | read + may hand in | read |

Reading any list needs only a valid token. Writing is checked by the permission classes in `backend/permissions.py`; a refusal comes back as a 403 with a sentence saying why, and the frontend shows that sentence in the red banner.

The frontend hides the buttons a role cannot use — `frontend/src/permissions.js` holds the same table — but that is only so the page does not offer things that will fail. **The API is what enforces it.** A hand-written `fetch` from the browser console is refused exactly the same way.

### What roles cannot do here

`Teacher` and `Student` rows are still not linked to login accounts. So the server cannot tell whose work a submission is, which means:

- a student can hand in work under any student's name, and
- "only show me my own courses / my own grades" is not possible.

That needs a foreign key from `Teacher` and `Student` to `User`, which is a bigger change than adding the role field was. A student is deliberately blocked from editing or deleting submissions for this reason — without ownership, "edit your own" cannot be told apart from "edit anyone's".

The superuser from `createsuperuser` has no `Profile` row; `role_of()` treats any superuser as an admin. Any other account without a Profile is treated as a student.

---

## How the frontend is put together

```
frontend/src/
  api.js              every call to the backend, in one file
  auth.js             the auth context and the useAuth() hook
  AuthContext.jsx     AuthProvider: who is logged in
  permissions.js      which buttons a role is worth showing
  flash.js            useFlash(): a "Saved" line that clears itself
  App.jsx             the list of URLs
  Sidebar.jsx         sidebar + content frame
  components/
    index.js          one import for all of the below
    Alert.jsx  Button.jsx  Checkbox.jsx  ConfirmDialog.jsx
    Div.jsx  IconButton.jsx  Input.jsx  PageHeader.jsx
    ProtectedRoute.jsx  Select.jsx  Table.jsx  Textarea.jsx
  pages/
    Login.jsx  Accounts.jsx  Dashboard.jsx  NotFound.jsx
    Students.jsx      <-- read this one first
    Teachers.jsx  Courses.jsx  Enrollments.jsx
    Lessons.jsx   Assignments.jsx
    Submissions.jsx   Results.jsx
```

**Start with `pages/Students.jsx`.** All eight resource pages are the same six steps, and that file is the one with the comments explaining each of them:

1. state for the rows, the form, and the errors
2. `useEffect()` reads the list from the API when the page opens
3. `reload()` re-runs that effect after a save or a delete
4. `handleSave()` creates a new row, or updates the one being edited
5. `askToDelete()` opens the confirm dialog; `confirmDelete()` runs once the user agrees
6. the JSX: banners, form, table, confirm dialog

### Telling the user what happened

Two banners sit above the form on every page:

- `<Alert>` in red for anything that went wrong. The message is whatever the backend said, flattened by `readError()` in `api.js`, so a rejected field reads `email: Enter a valid email address.` rather than `[object Object]`.
- `<Alert variant="success">` in green for `Teacher added.`, `Teacher updated.`, `Teacher deleted.` The text comes from `useFlash()` in `flash.js`, which clears it after four seconds so it does not pile up.

Deleting goes through `components/ConfirmDialog.jsx`, not `window.confirm()`. The trash button only records which row was clicked; the dialog names that row and spells out what else the delete takes with it ("Their courses go too"), and closes on Cancel, on Escape, or on a click outside the card. The confirm button reads "Deleting…" and is disabled while the request is in flight.

The repetition across the eight pages is deliberate. Each page stands on its own so you can read one without chasing an abstraction through four other files. The only things shared are the plain UI pieces in `components/` and the network calls in `api.js`.

No Redux, no React Query, no axios — `useState`, `useEffect`, and `fetch`.

Two pages do a little more than the other six:

- **Assignments** narrows the lesson dropdown to the lessons of the chosen course, and converts the `datetime-local` value to UTC on the way out and back to local time on the way in.
- **Results** leaves out submissions that already have a result, because `Results.submission` is one-to-one.

---

## Things about this backend that will confuse you

These are real quirks of the API, not bugs in the frontend. Each one is commented where it matters in the code.

| What | Why it matters |
|---|---|
| Login is by **phone** | A username/password form will always fail. |
| Tokens come back **nested** | `data.tokens.access`, not `data.access`. |
| **No pagination** | List endpoints return a plain array. `data.map(...)`, never `data.results.map(...)`. |
| Foreign keys are **plain integers** | A course sends `{ "teacher": 3 }`. To show the teacher's *name* the frontend fetches `/api/teacher/` too and joins the two lists in JavaScript. That is why most pages load two or three endpoints at once. |
| **No filtering** | You cannot ask for "lessons in course 3". Every list downloads in full. |
| `auto_now_add` fields are read-only | `Enrollment.enrollment_date` and `Submission.submitted_at` are set by the server and silently ignored if you send them, so they are shown in tables but never in forms. |
| **No token refresh endpoint** | The access token cannot be renewed. When it expires the app clears the session and sends you back to `/login`. `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` is set to 8 hours so this does not happen mid-session while you are learning. |
| **No logout endpoint** | Logging out just discards the saved token. The token stays valid on the server until it expires. |
| `Results.submission` is one-to-one | A submission can only be graded once. A second attempt returns a 400; the Results page turns it into a readable message. |
| **Records are not accounts** | `Teacher`/`Student` rows are not linked to login accounts, so "my courses" and "my grades" are not possible without a model change. Roles exist (see above), ownership does not. |

---

## API endpoints

Base URL: `http://127.0.0.1:8000/api`

| Path | Methods | Auth |
|---|---|---|
| `/register/` | POST | **Admin only** |
| `/login/` | POST | No |
| `/profile/` | GET | Yes |
| `/password-reset/` | POST | No |
| `/password-reset-confirm/` | POST | No |
| `/teacher/`, `/teacher/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/student/`, `/student/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/course/`, `/course/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/enrollment/`, `/enrollment/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/lesson/`, `/lesson/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/assignment/`, `/assignment/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/submission/`, `/submission/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |
| `/results/`, `/results/{id}/` | GET POST / GET PUT PATCH DELETE | Yes |

Django admin is at http://127.0.0.1:8000/admin/ and every model is registered there, which is the quickest way to add test data.

Note the naming: `/submission/` is singular but `/results/` is plural.

---

## Known gaps

Password reset is not usable end to end. `EMAIL_BACKEND` is the console backend, so reset links only print to the terminal running Django, and no `/reset-password` page exists in the frontend yet.
