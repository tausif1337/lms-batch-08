# Running the LMS manually

Three things have to be up, in this order:

1. **MariaDB / MySQL** — port `3306`
2. **Django backend** — port `8001`
3. **Vite frontend** — port `5180`

> **The backend runs on 8001, not 8000.** The frontend calls
> `http://127.0.0.1:8001/api` (see `frontend/src/api.js`). If you start Django on
> 8000, the app loads but every page shows a connection error.

---

## 1. Start the database

```bash
brew services start mariadb
```

Check it is listening:

```bash
lsof -nP -iTCP:3306 -sTCP:LISTEN
```

If nothing prints, it did not start.

### First time only — create the database and user

```sql
CREATE DATABASE lms_db;
CREATE USER 'lms_user'@'127.0.0.1' IDENTIFIED BY 'lms_user_pw';
GRANT ALL PRIVILEGES ON lms_db.* TO 'lms_user'@'127.0.0.1';
```

Paste that into `mysql -u root`. To use different credentials, set `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `DB_HOST` or `DB_PORT` as environment variables
instead of editing `backend/lms/settings.py`.

Confirm the user can get in:

```bash
mysql -h 127.0.0.1 -u lms_user -plms_user_pw -e "SHOW DATABASES;"
```

`lms_db` should be in the list.

---

## 2. Start the backend

```bash
cd ~/Desktop/lms-batch-08/backend
python3 manage.py runserver 8001
```

Leave this terminal open. It prints every API request, which is the fastest way
to see what the frontend is actually asking for.

### First time only — install and migrate

```bash
cd ~/Desktop/lms-batch-08/backend
pip3 install -r requirements.txt
python3 manage.py migrate
```

Check what is installed:

```bash
python3 -c "import django, rest_framework, rest_framework_simplejwt, corsheaders, MySQLdb; print('all deps OK')"
```

<details>
<summary>Using a virtualenv instead (recommended on a fresh machine)</summary>

```bash
cd ~/Desktop/lms-batch-08/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001
```

You must run `source venv/bin/activate` in every new terminal before
`manage.py`. Deactivate with `deactivate`.
</details>

---

## 3. Start the frontend

Open a **second** terminal — the backend needs to keep running in the first.

```bash
cd ~/Desktop/lms-batch-08/frontend
npm run dev
```

Wait for:

```
➜  Local:   http://localhost:5180/
```

Open that URL.

### First time only — install packages

```bash
cd ~/Desktop/lms-batch-08/frontend
npm install
```

Without this you get `sh: vite: command not found`.

---

## 4. Log in

**You log in with a phone number, not a username and not an email.** The backend
looks you up through `Profile.phone`.

There is no public sign-up. An admin creates accounts on the **Accounts** page
inside the app.

### Starting from an empty database

`createsuperuser` alone is **not** enough — it does not create a Profile, so that
account has no phone number to log in with. Three steps:

1. `python3 manage.py createsuperuser`
2. Open http://127.0.0.1:8001/admin/backend/profile/add/ — pick that user, give
   it a phone number, set the role to **Admin**, save.
3. Log in at http://localhost:5180/login with that phone number.

---

## Keeping the servers running after you close the terminal

The commands above stop when you close their terminal. To detach them:

```bash
cd ~/Desktop/lms-batch-08/backend
nohup python3 manage.py runserver 8001 > /tmp/lms-backend.log 2>&1 &

cd ~/Desktop/lms-batch-08/frontend
nohup npm run dev > /tmp/lms-frontend.log 2>&1 &
```

Read their output with `tail -f /tmp/lms-backend.log`.

Stop them again:

```bash
pkill -f "runserver 8001"
pkill -f "node.*vite"
```

---

## Stopping everything

| What | Command |
|---|---|
| Backend / frontend in a terminal | `Ctrl+C` |
| Detached backend | `pkill -f "runserver 8001"` |
| Detached frontend | `pkill -f "node.*vite"` |
| Database | `brew services stop mariadb` |

---

## Troubleshooting

### `Could not reach the server. Is Django running on http://127.0.0.1:8001?`

The backend is down, or it is on the wrong port. Check:

```bash
lsof -nP -iTCP:8001 -sTCP:LISTEN
```

Empty means nothing is serving 8001. Common cause: Django was started with plain
`runserver`, which defaults to 8000.

### `Error: That port is already in use.`

Something is already on 8001 — often an old Django you forgot about. Find and
kill it:

```bash
lsof -nP -iTCP:8001 -sTCP:LISTEN     # note the PID
kill <PID>
```

### Every API call fails, browser console says CORS

Vite found 5180 busy and quietly picked another port. Look at what Vite actually
printed. `backend/lms/settings.py` only whitelists **5180** and **5173** in
`CORS_ALLOWED_ORIGINS` — add your port there, or free up 5180.

### `pywatchman.SocketTimeout: timed out waiting for response`

Django's auto-reloader is waiting on Watchman. Either:

```bash
python3 manage.py runserver 8001 --noreload    # you restart it yourself after edits
```

or raise the timeout:

```bash
DJANGO_WATCHMAN_TIMEOUT=20 python3 manage.py runserver 8001
```

### `sh: vite: command not found`

`node_modules` is missing. Run `npm install` in `frontend/`.

### `django.db.utils.OperationalError: (2002, "Can't connect to server")`

MariaDB is not running. `brew services start mariadb`.

---

## Quick reference

| | URL |
|---|---|
| App | http://localhost:5180 |
| API | http://127.0.0.1:8001/api |
| Django admin | http://127.0.0.1:8001/admin/ |

```bash
# terminal 1
cd ~/Desktop/lms-batch-08/backend && python3 manage.py runserver 8001

# terminal 2
cd ~/Desktop/lms-batch-08/frontend && npm run dev
```
