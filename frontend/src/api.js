// Every call to the Django backend lives in this one file.
//
// Two things about the backend shape the code here:
//   - you log in with a phone number, and the tokens come back nested
//     under `tokens`, so it is data.tokens.access and not data.access
//   - list endpoints are paginated and filtered, so a list call answers with
//     {count, page, page_size, total_pages, next, previous, results} and not
//     with a bare array. list() hands that envelope back untouched; listAll()
//     is the one that walks every page and returns just the rows.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api";

const TOKEN_KEY = "lms_access_token";
const USER_KEY = "lms_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSavedUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Django REST Framework reports errors in a few different shapes:
//   {"detail": "..."}                     a permission or 404 error
//   {"error": "..."}                      the hand-written login view
//   {"phone": ["This field is required"]} a serializer rejecting a field
// This turns all of them into one readable line.
function readError(body, response) {
  if (!body || typeof body !== "object") {
    return `Request failed (${response.status})`;
  }

  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  const parts = [];
  for (const [field, value] of Object.entries(body)) {
    const text = Array.isArray(value) ? value.join(" ") : String(value);
    parts.push(field === "non_field_errors" ? text : `${field}: ${text}`);
  }

  if (parts.length === 0) {
    return `Request failed (${response.status})`;
  }

  return parts.join("\n");
}

// There is no refresh endpoint on this backend. When the access token is
// rejected the only thing left to do is drop the session and let the router
// send the user back to /login.
function handleExpiredToken() {
  clearSession();
  window.dispatchEvent(new Event("lms:unauthorised"));
}

async function request(path, options = {}) {
  const { auth = true, ...rest } = options;

  const headers = { ...(rest.headers ?? {}) };
  if (rest.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(BASE_URL + path, { ...rest, headers });
  } catch {
    throw new Error(
      "Could not reach the server. Is Django running on http://127.0.0.1:8001?",
    );
  }

  if (response.status === 401 && auth) {
    handleExpiredToken();
    throw new Error("Your session has expired. Please log in again.");
  }

  // DELETE returns 204 with an empty body, so there is nothing to parse.
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new Error(readError(body, response));
  }

  return body;
}

// --- auth ---------------------------------------------------------------

export function login(phone, password) {
  return request("/login/", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
    auth: false,
  });
}

// Creating an account is an admin job, so this call carries the admin's own
// token. There is no public sign-up.
export function register(details) {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify(details),
  });
}

export function fetchProfile() {
  return request("/profile/");
}

// Your own name, email and phone. The server only ever edits the account the
// token belongs to, and it will not accept `role` from here.
export function updateProfile(values) {
  return request("/profile/", {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

// Needs the current password, not just a live session.
export function changePassword(values) {
  return request("/change-password/", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function requestPasswordReset(email) {
  return request("/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
    auth: false,
  });
}

export function confirmPasswordReset(details) {
  return request("/password-reset-confirm/", {
    method: "POST",
    body: JSON.stringify(details),
    auth: false,
  });
}

// --- resources ----------------------------------------------------------

// {page: 2, search: "", course: 3} becomes "?page=2&course=3".
//
// Empty values are dropped rather than sent as blanks. An empty ?search= or
// ?course= would be the filter sitting on "Any", and the server ignores those
// anyway, so leaving them out keeps the address bar and the network tab
// readable.
export function toQueryString(params) {
  if (!params) {
    return "";
  }

  const parts = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    parts.set(key, String(value));
  }

  const text = parts.toString();
  return text ? `?${text}` : "";
}

// The largest page the server will hand out in one go. Kept in step with
// max_page_size in backend/pagination.py.
const BIGGEST_PAGE = 200;

// Every row, gathered a page at a time.
//
// The tables page through the data, but the dropdowns and the id-to-name
// lookups need the whole list: a course row carries {"teacher": 3}, and
// showing the teacher's name means holding every teacher. Those lists are
// small, and this is the only place that pays for them.
async function everyPage(path, params) {
  const rows = [];

  for (let page = 1; ; page += 1) {
    const body = await request(
      `/${path}/${toQueryString({ ...params, page, page_size: BIGGEST_PAGE })}`,
    );

    // An endpoint that was never paginated would answer with a plain array.
    if (Array.isArray(body)) {
      return body;
    }

    rows.push(...(body?.results ?? []));

    if (!body?.next) {
      return rows;
    }
  }
}

// Every resource has the same five calls, so they are built from the path
// once instead of being written out eight times over.
function resource(path) {
  return {
    // One page, plus the counts around it. `params` carries page, page_size,
    // search, ordering and whatever filters the view accepts.
    list: (params) => request(`/${path}/${toQueryString(params)}`),

    // Every row, with no envelope. For dropdowns and name lookups.
    listAll: (params) => everyPage(path, params),

    // How many rows match, without downloading any of them. The dashboard
    // tiles use this, so a count no longer costs a full table.
    count: async (params) => {
      const body = await request(
        `/${path}/${toQueryString({ ...params, page_size: 1 })}`,
      );
      return Array.isArray(body) ? body.length : (body?.count ?? 0);
    },

    create: (values) =>
      request(`/${path}/`, { method: "POST", body: JSON.stringify(values) }),
    update: (id, values) =>
      request(`/${path}/${id}/`, {
        method: "PUT",
        body: JSON.stringify(values),
      }),
    remove: (id) => request(`/${path}/${id}/`, { method: "DELETE" }),
  };
}

export const teachersApi = resource("teacher");
export const studentsApi = resource("student");
export const coursesApi = resource("course");
export const enrollmentsApi = resource("enrollment");
export const lessonsApi = resource("lesson");
export const assignmentsApi = resource("assignment");
export const submissionsApi = resource("submission");

// Note the naming: /submission/ is singular but /results/ is plural.
export const resultsApi = resource("results");
