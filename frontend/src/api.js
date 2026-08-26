// Every call to the Django backend happens in this file.
//
// Two things about this backend are easy to trip over:
//   - you log in with a phone number, not an email or a username
//   - every address ends with a slash. "/login" without it does not work.

import { getToken } from "./auth.js";

const BASE_URL = "http://127.0.0.1:8001/api";

// Django does not report errors in one single shape. These are the three we
// actually get back, and this turns any of them into one sentence we can put
// on the screen.
function readError(data) {
  // {"detail": "Only an admin can create accounts."}
  if (data.detail) {
    return data.detail;
  }

  // {"error": "Invalid phone or password"} - written by hand in the login view
  if (data.error) {
    return data.error;
  }

  // {"phone": ["This phone number is already registered."]}
  // One line for each field Django complained about.
  const lines = [];

  for (const field in data) {
    const value = data[field];

    // The value is usually a list of messages, so join them into one string.
    if (Array.isArray(value)) {
      lines.push(field + ": " + value.join(" "));
    } else {
      lines.push(field + ": " + value);
    }
  }

  if (lines.length > 0) {
    return lines.join("\n");
  }

  return "Something went wrong.";
}

// One function that does the talking, so login and register below stay short.
//
//   method     "GET" or "POST"
//   path       the bit after /api, for example "/login/"
//   body       the object to send, or nothing at all for a GET
//   sendToken  false for logging in. See the note below.
async function request(method, path, body, sendToken = true) {
  // What we send along with the request. Content-Type tells Django that the
  // body is JSON and not, say, a filled-in HTML form.
  const headers = { "Content-Type": "application/json" };

  // If we are logged in, send the token too. This is what makes Django treat
  // the request as coming from us instead of from a stranger.
  //
  // Logging in is the one request that must NOT send a token. Django checks
  // the token before it even looks at the login view, so an old token left
  // over from a deleted or expired account gets you a 401 "User not found"
  // and you can never log back in. Sending nothing avoids that.
  if (sendToken) {
    const token = getToken();
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }

  let response;

  try {
    response = await fetch(BASE_URL + path, {
      method: method,
      headers: headers,
      // JSON.stringify turns our object into the text that gets sent.
      body: JSON.stringify(body),
    });
  } catch {
    // fetch only fails like this when the request never arrived at all.
    throw new Error(
      "Could not reach the server. Is Django running on " + BASE_URL + "?",
    );
  }

  // The reply arrives as text. This turns it back into a JavaScript object.
  const data = await response.json();

  // response.ok is true for a status in the 200s. Anything else - 400, 401,
  // 403 - means Django refused, and the reason is inside data.
  if (!response.ok) {
    throw new Error(readError(data));
  }

  return data;
}

// Log in with a phone number and a password. The last argument is false so
// that no leftover token is sent along - see the note inside request().
export function login(phone, password) {
  return request("POST", "/login/", { phone: phone, password: password }, false);
}

// Create an account. Only an admin is allowed to do this, and the token added
// by request() above is how Django knows the caller is one.
export function register(newAccount) {
  return request("POST", "/register/", newAccount);
}
