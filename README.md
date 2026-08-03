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

Register a new account at http://localhost:5180/register. Registering does not hand back a token, so the app immediately logs you in behind the scenes using the phone number you just typed.

---

## How the frontend is put together

```
frontend/src/
  api.js              every call to the backend, in one file
  auth.js             the auth context and the useAuth() hook
  AuthContext.jsx     AuthProvider: who is logged in
  App.jsx             the list of URLs
  Sidebar.jsx         sidebar + content frame
  components/
    index.js          one import for all of the below
    Alert.jsx  Button.jsx  Checkbox.jsx  Div.jsx  IconButton.jsx
    Input.jsx  PageHeader.jsx  ProtectedRoute.jsx
    Select.jsx  Table.jsx  Textarea.jsx
  pages/
    Login.jsx  Register.jsx  Dashboard.jsx  NotFound.jsx
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
5. `handleDelete()` confirms, then deletes
6. the JSX: error banner, form, table

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
