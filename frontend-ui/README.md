# LMS — the screens only

This is a small Learning Management System, built with React. It shows
teachers, students, courses, lessons, assignments and marks.

**There is no server and no database.** Everything you see comes from one file
of made-up data. Nothing you type is saved. That is on purpose: it means you
can read and change the whole thing without installing anything else.

## Start it

Open a terminal in this folder and run these two commands:

```bash
npm install
npm run dev
```

The second command prints a web address. Open it in your browser. Leave the
terminal running while you work — when you save a file, the page updates by
itself.

To stop it, press `Ctrl + C` in that terminal.

## Where everything is

```
src/
  main.jsx      the first file that runs. It puts the app on the page.
  App.jsx       the list of addresses: "/teachers" shows the Teachers page
  Sidebar.jsx   the menu down the left, and the frame around each page
  data.js       ALL the data. Every table on screen comes from here.
  index.css     one line, which turns Tailwind on

  pages/        one file per screen
    Dashboard.jsx     the eight counting tiles
    Teachers.jsx      <- READ THIS ONE FIRST
    Students.jsx
    Courses.jsx
    Enrollments.jsx
    Lessons.jsx
    Assignments.jsx
    Submissions.jsx
    Results.jsx
    Login.jsx
    Register.jsx
```

That is the whole app. Eleven pages and four other files.

## Read it in this order

1. **`src/data.js`** — see what a teacher, a student and a course look like.
2. **`src/pages/Teachers.jsx`** — the simplest full page. It is heavily
   commented and explains each React idea the first time it appears.
3. **`src/pages/Courses.jsx`** — the same page again, plus one new idea:
   looking up a name in another list.
4. Everything else. Students, Lessons, Enrollments, Assignments, Submissions
   and Results are all the same shape as Teachers.jsx. Once you have read one,
   you can read them all.

Every list page is built in three parts, marked with big comment banners:

```
1. REMEMBER THINGS   the useState lines, one per box in the form
2. DO THINGS         the small functions the buttons call
3. SHOW THINGS       the HTML that ends up on screen
```

## What the buttons do

| Button | What happens |
| --- | --- |
| **Add** | Opens an empty form |
| **Pencil** | Opens the form with that row's details filled in |
| **Save** | Closes the form. Nothing is saved. |
| **Cancel** / **X** | Closes the form |
| **Bin** | Nothing. There is no place to delete from. |
| **Log in** / **Create account** | Goes to the dashboard. No password is checked. |
| **Log out** | Goes to the login screen. Nobody was logged in. |

## Change something

**Add a teacher to the list:** open `src/data.js`, find `export const teachers`,
copy one of the blocks, change the `id` to a number nothing else is using, and
save. The Teachers page and the dashboard count both update on their own.

**Change a colour:** the colours are Tailwind class names written straight into
the HTML, like `bg-indigo-600`. Change it to `bg-green-600` and save.

**Add a menu item:** open `src/Sidebar.jsx` and add a line to the `menu` list at
the top.

## Things you will not find here

No `fetch`, no login, no tokens, no shared component library, no state
management library. Each page stands on its own and can be read top to bottom
without opening another file.

The price of that is repetition — the same button styling appears in several
pages. That is a deliberate trade: less to jump between while you are learning.

## The tools this uses

- **React** — builds the screens
- **React Router** — gives each screen its own web address
- **Tailwind CSS** — the styling, written as class names in the HTML
- **lucide-react** — the small icons
- **Vite** — runs it while you work, and packages it up for real use

Two other commands exist if you want them:

```bash
npm run lint    # checks the code for mistakes
npm run build   # packages the app into a dist/ folder
```
