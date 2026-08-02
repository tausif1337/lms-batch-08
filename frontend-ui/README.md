# LMS — UI only

The LMS admin screens with everything behind them taken out. No API calls, no
authentication, no state that outlives a click. Use it to work on layout and
styling without needing Django, a database, or a login.

## Run it

```bash
npm install
npm run dev
```

Opens on <http://localhost:5180>. (The full-stack app in `../frontend` uses
5173, so both can run side by side.)

## What is here

```
src/
  data.js              static sample rows for all eight resources
  main.jsx             mounts the router
  App.jsx              routes — nothing is gated
  components/
    Layout.jsx         sidebar frame
    ui.jsx             Button, Field, Input, Textarea, Select, Card, Table, PageHeader
  pages/               one page per screen
```

`src/pages/StudentsPage.jsx` is the pattern page. Every other resource page is
the same shape, so read that one first.

## How it behaves

- Tables are drawn from the arrays in `src/data.js`.
- **Add** and **Edit** open the form panel and fill it in. Typing works.
- **Save** and **Cancel** close the panel. Nothing is written — the table does
  not change, because `data.js` is never mutated.
- **Delete** is decorative.
- **Log in** and **Create account** accept anything and go to the dashboard.
- **Log out** goes to the login screen. There is no session to end.

## Differences from `../frontend`

Removed: `api.js`, `AuthContext.jsx`, `ProtectedRoute.jsx`, `.env.example`, and
the loading / error / saving states that only existed to report on network
calls. The `Alert` and `Spinner` components went with them — nothing was left
to show. Markup and Tailwind classes are otherwise unchanged.

To wire this back to a real API, put the fetch layer back in `src/api.js` and
swap the `../data` imports in each page for it.
