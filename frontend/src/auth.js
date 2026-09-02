const ACCESS_TOKEN_STORAGE_KEY = "lms_token";
const REFRESH_TOKEN_STORAGE_KEY = "lms_refresh";
const LOGGED_IN_USER_STORAGE_KEY = "lms_user";

export function saveLoggedInUser(tokens, user) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.access);

  if (tokens.refresh) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);
  }

  localStorage.setItem(LOGGED_IN_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function saveNewAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function getLoggedInUser() {
  const savedText = localStorage.getItem(LOGGED_IN_USER_STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch {
    forgetLoggedInUser();
    return null;
  }
}

export function updateLoggedInUser(user) {
  localStorage.setItem(LOGGED_IN_USER_STORAGE_KEY, JSON.stringify(user));
}

export function forgetLoggedInUser() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LOGGED_IN_USER_STORAGE_KEY);
}
