# LMS — frontend

The React half of a small Learning Management System. It talks to the Django
backend in [`../backend`](../backend) over a JSON API and shows teachers,
students, courses, enrollments, lessons, assignments, submissions and results.

Everything on screen comes from the server. There is no mock data: if the
backend is not running, the pages say so instead of inventing rows.

## Start it

The backend has to be up first — see [`../README.md`](../README.md). Then, in
this folder:

```bash
npm install
npm run dev
```

That prints a web address (http://localhost:5180 unless the port is taken).
Leave the terminal running while you work; saving a file updates the page.
`Ctrl + C` stops it.

Two other commands:

```bash
npm run lint     # checks the code for mistakes
npm run build    # packages the app into dist/
```

## Pointing it at a different backend

By default it calls `http://127.0.0.1:8001/api`. To change that, make a
`.env.local` file in this folder:

```
VITE_API_URL=http://127.0.0.1:8001/api
```

See [`.env.example`](.env.example). Whatever host you use has to be listed in
`CORS_ALLOWED_ORIGINS` in `backend/lms/settings.py`, or the browser blocks the
call before it leaves.

## Logging in

You sign in with a **phone number**, not a username. There is no public
sign-up: an admin creates accounts from the Accounts page inside the app.

If there is no admin account yet, make one with
`python manage.py createsuperuser` in the backend folder — a superuser counts
as an admin.

While running `npm run dev`, the login page also lists the seeded local
accounts with a one-click button. That block is dropped from `npm run build`.

## The three roles

The sidebar and the buttons on each page follow the role on your account. The
server enforces the same rules, so hiding a button is only about not offering
something that would fail.

| | Admin | Teacher | Student |
| --- | --- | --- | --- |
| Teachers, Students | add, edit, delete | read | read |
| Courses, Enrollments, Lessons, Assignments, Results | add, edit, delete | add, edit, delete | read |
| Submissions | add, edit, delete | add, edit, delete | hand in only |
| Accounts | yes | no | no |
| Your own profile | yes | yes | yes |

The copy of these rules used to decide which buttons to draw is in
`src/permissions.js`. It mirrors `backend/permissions.py` — change one and
change the other.

## Where everything is

```
src/
  main.jsx           the first file that runs. It puts the app on the page.
  App.jsx            the list of addresses: "/teachers" shows the Teachers page
  api.js             every call to the backend, and the saved session
  auth.js            the auth context and its useAuth() hook
  AuthContext.jsx    holds who is logged in, and logs them in and out
  permissions.js     which role may do what, for the buttons
  useTableQuery.js   page, page size, search, sort and filter state for the
                     eight table pages, in one hook instead of eight copies
  Sidebar.jsx        the menu, and the frame around every signed-in page
  index.css          one line, which turns Tailwind on

  components/        the shared pieces every page is built from
    Alert.jsx          the coloured message strip
    Button.jsx         primary, secondary and danger buttons
    Checkbox.jsx
    ConfirmDialog.jsx  replaces window.confirm() before a delete
    FilterBar.jsx      the search box and dropdowns above a table
    IconButton.jsx     the pencil and bin buttons in a table row
    Input.jsx          a labelled box; passwords get a show/hide eye
    PageHeader.jsx     the title and subtitle at the top of a page
    Pagination.jsx     the row count, page size and page buttons below a table
    ProtectedRoute.jsx sends you to /login without a token
    Select.jsx
    Table.jsx          the header row, sortable; the pages supply the body
    Textarea.jsx
    index.js           one import line instead of thirteen

  pages/             one file per screen
    Login.jsx           phone and password
    ForgotPassword.jsx  step one of a reset: ask for the email
    ResetPassword.jsx   step two: the ?uid= and ?token= from the emailed link
    Dashboard.jsx       the eight counting tiles
    Teachers.jsx      <- READ THIS ONE FIRST
    Students.jsx
    Courses.jsx
    Enrollments.jsx
    Lessons.jsx
    Assignments.jsx
    Submissions.jsx
    Results.jsx
    Accounts.jsx        an admin creating a login for somebody
    Profile.jsx         your own details, and your own password
    NotFound.jsx
```

## Read it in this order

1. **`src/api.js`** — every request the app makes, in one file. It also holds
   the two things about this backend that shape the rest: you log in with a
   phone number, and the tokens arrive nested under `tokens`.
2. **`src/pages/Teachers.jsx`** — the simplest full page. It is commented
   step by step, and the other seven list pages are the same shape.
3. **`src/pages/Courses.jsx`** — the same page again, plus one new idea:
   showing a name that lives in another list.
4. Everything else.

Each list page is built the same way:

```
1. state for the rows, the form and the messages
2. useTableQuery()  the page, search, sort and filters, and query.params
3. useEffect()      reads one page of rows whenever query.params changes
4. reload()         re-runs that after a save or a delete
5. handleSave()     creates a new row, or updates the one being edited
6. askToDelete() / confirmDelete()   opens the dialog, then deletes
7. the JSX: banners, form, FilterBar, Table, Pagination, confirm dialog
```

The list endpoints are paginated, so a list call answers with
`{count, page, page_size, total_pages, next, previous, results}` rather than a
bare array. `list()` in `api.js` hands that envelope back untouched and the page
reads `.results`; `listAll()` is the one that walks every page, which is what the
dropdowns and the id-to-name lookups use.

## What the buttons do

| Button | What happens |
| --- | --- |
| **Add** | Opens an empty form |
| **Pencil** | Opens the form with that row's details filled in |
| **Save** | POSTs or PUTs to the backend, then reloads the table |
| **Cancel** / **X** | Closes the form without saving |
| **Bin** | Asks first, then DELETEs the row |
| **A column header** | Sorts by it; clicking again turns the sort around |
| **Page buttons** | Asks the server for that page — the rest is never downloaded |
| **Clear** | Drops the search and every filter, back to the plain list |
| **Log in** | Checks the phone and password, and stores the token |
| **Log out** | Discards the token and returns to the login page |

## The session

The access token lives in `localStorage`, so a page refresh does not sign you
out. There is no refresh endpoint on this backend, so when a token is rejected
the session is simply dropped and you are sent back to `/login`.

Changing your password ends the session on purpose: the tokens already issued
are retired server-side, so you log in again with the new one.

## Forgotten passwords

`/forgot-password` asks the backend to email a link. The link lands on
`/reset-password?uid=...&token=...`, which posts both back with the new
password.

In development, Django's mail backend prints the email to its own terminal
instead of sending it — copy the link out of there. Where the link points is
`FRONTEND_PASSWORD_RESET_URL` in `backend/lms/settings.py`.

## The tools this uses

- **React** — builds the screens
- **React Router** — gives each screen its own web address
- **Tailwind CSS** — the styling, written as class names in the HTML
- **lucide-react** — the small icons
- **Vite** — runs it while you work, and packages it up for real use
