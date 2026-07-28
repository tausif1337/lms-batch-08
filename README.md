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

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**.

The port matters. The backend's CORS whitelist contains only 5173, so `vite.config.js` sets `strictPort: true` — if 5173 is busy, Vite will refuse to start rather than quietly move to 5174 and leave every API call failing.

---

## Logging in

**You log in with a phone number, not a username and not an email.** That is how the backend is built: it looks you up through `Profile.phone`.

Register a new account at http://localhost:5173/register. Registering does not hand back a token, so the app immediately logs you in behind the scenes using the phone number you just typed.

---

## How the frontend is put together

```
frontend/src/
  api.js              every call to the backend, in one file
  AuthContext.jsx     who is logged in
  App.jsx             the list of URLs
  components/
    ui.jsx            Button, Input, Select, Table, Card, Alert, ...
    Layout.jsx        sidebar + content frame
    ProtectedRoute.jsx
  pages/
    LoginPage.jsx  RegisterPage.jsx  DashboardPage.jsx
    StudentsPage.jsx      <-- read this one first
    TeachersPage.jsx  CoursesPage.jsx  EnrollmentsPage.jsx
    LessonsPage.jsx   AssignmentsPage.jsx
    SubmissionsPage.jsx   ResultsPage.jsx
```

**Start with `pages/StudentsPage.jsx`.** All eight resource pages are the same six steps, and that file is the one with the comments explaining each of them:

1. state for the rows, the form, and the errors
2. `load()` reads the list from the API
3. `useEffect()` calls `load()` once when the page opens
4. `handleSubmit()` creates a new row, or updates the one being edited
5. `handleDelete()` confirms, then deletes
6. the JSX: error banner, form, table

The repetition across the eight pages is deliberate. Each page stands on its own so you can read one without chasing an abstraction through four other files.

No Redux, no React Query, no axios — `useState`, `useEffect`, and `fetch`.

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
| **No roles** | There is no teacher/student distinction on the account, and `Teacher`/`Student` rows are not linked to login accounts at all. So there is no per-role UI, and "my courses" is not possible without a backend model change. |
| **Everyone can edit everything** | Every endpoint only checks that you are logged in. Any account can delete any record. Fine for learning, not for production. |

---

## API endpoints

Base URL: `http://127.0.0.1:8000/api`

| Path | Methods | Auth |
|---|---|---|
| `/register/` | POST | No |
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
