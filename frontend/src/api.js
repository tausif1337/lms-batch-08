// Every call to the Django backend lives in this one file.
//
// Two things about the backend shape the code here:
//   - you log in with a phone number, and the tokens come back nested
//     under `tokens`, so it is data.tokens.access and not data.access
//   - list endpoints are not paginated, so they return a plain array

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

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
      "Could not reach the server. Is Django running on http://127.0.0.1:8000?",
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

// Registering does not return a token, so the caller logs in straight
// afterwards with the phone number that was just used.
export function register(details) {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify(details),
    auth: false,
  });
}

export function fetchProfile() {
  return request("/profile/");
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

// Every resource has the same four calls, so they are built from the path
// once instead of being written out eight times over.
function resource(path) {
  return {
    list: () => request(`/${path}/`),
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
