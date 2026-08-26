// Where we remember who is logged in.
//
// localStorage is a small box of text that the browser keeps for us. It
// survives a page refresh and even closing the tab, which is why a refresh
// does not throw you back to the login page.
//
// It only stores text, so the user object has to be turned into text on the
// way in (JSON.stringify) and back into an object on the way out (JSON.parse).

const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

// Called after a successful login.
export function saveLogin(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// The token is the proof that we are logged in. api.js sends it with every
// request so Django knows who is asking.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// The person who is logged in, or null when nobody is.
export function getUser() {
  const text = localStorage.getItem(USER_KEY);

  // Nothing saved means nobody is logged in.
  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

// Logging out. There is no logout endpoint on this backend, so throwing the
// token away is all we can do. It stays valid on the server until it expires.
export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
