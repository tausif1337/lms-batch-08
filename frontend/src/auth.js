const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";


// Save the JWT and user information
export function saveLogin(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}


// Get the JWT token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}


// Get the logged in user
export function getUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}


// Logout
export function clearLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}