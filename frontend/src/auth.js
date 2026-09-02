const TOKEN_KEY = "lms_token";
const REFRESH_KEY = "lms_refresh";
const USER_KEY = "lms_user";

// The access token is short lived on purpose. The refresh token is what keeps
// you signed in across the day: api.js trades it for a new access token the
// first time one comes back expired.
export function saveLogin(tokens, user) {
  localStorage.setItem(TOKEN_KEY, tokens.access);
  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { clearLogin(); return null; }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
