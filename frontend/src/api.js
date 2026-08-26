// Every call to the Django backend goes through this one file.
//
// Three things about the backend shape the code here:
//   - you log in with a phone number, not an email
//   - the tokens come back nested, so it is data.tokens.access, not data.access
//   - every path ends in a slash. /api/login (no slash) redirects and the
//     POST body is thrown away on the way.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api";

const TOKEN_KEY = "lms_access_token";
const USER_KEY = "lms_user";

// --- where the session lives --------------------------------------------

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

// --- turning Django's errors into one sentence --------------------------

// Django REST Framework reports errors in a few different shapes:
//   {"detail": "..."}                     a permission or 404 error
//   {"error": "..."}                      the hand-written login view
//   {"phone": ["This field is required"]} a serializer rejecting a field
// This turns all of them into one readable line.
function readError(data, status) {
  if (!data || typeof data !== "object") {
    return `Request failed (${status})`;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  const parts = [];
  for (const [field, value] of Object.entries(data)) {
    const text = Array.isArray(value) ? value.join(" ") : String(value);
    parts.push(field === "non_field_errors" ? text : `${field}: ${text}`);
  }

  if (parts.length === 0) {
    return `Request failed (${status})`;
  }

  return parts.join("\n");
}

// There is no refresh endpoint on this backend. When the access token is
// rejected the only thing left to do is drop the session. api.js is a plain
// module with no way to reach React, so it shouts through a browser event
// and AuthContext listens for it.
function handleExpiredToken() {
  clearSession();
  window.dispatchEvent(new Event("lms:unauthorised"));
}

// --- the client ---------------------------------------------------------

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Runs before every request. This is the whole reason for having one client:
// the token gets attached in a single place instead of at 30 call sites.
//
// `skipAuth` is our own flag, not an axios one. Do not call it `auth` --
// axios already uses that name for HTTP Basic credentials.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.skipAuth !== true) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Runs after every response. Two jobs:
//   1. unwrap .data once, so callers get the JSON and not the axios envelope
//   2. turn every failure into a plain Error carrying a readable message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // No response at all means the request never landed: Django is down,
    // or the port is wrong.
    if (!error.response) {
      return Promise.reject(
        new Error(
          "Could not reach the server. Is Django running on http://127.0.0.1:8001?",
        ),
      );
    }

    const { status, data } = error.response;

    if (status === 401 && error.config?.skipAuth !== true) {
      handleExpiredToken();
      return Promise.reject(
        new Error("Your session has expired. Please log in again."),
      );
    }

    return Promise.reject(new Error(readError(data, status)));
  },
);

// --- auth ---------------------------------------------------------------

// You log in with a phone number. There is no username or email login.
export function login(phone, password) {
  return api.post("/login/", { phone, password }, { skipAuth: true });
}

// Creating an account is an admin job, so this call carries the admin's own
// token. There is no public sign-up on this backend: RegisterView is guarded
// by IsAdmin, and an anonymous POST here comes back 403.
export function register(details) {
  return api.post("/register/", details);
}

export function fetchProfile() {
  return api.get("/profile/");
}

export default api;
