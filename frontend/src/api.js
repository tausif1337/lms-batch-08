import axios from "axios";
import { clearLogin, getRefreshToken, getToken, setToken } from "./auth.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// A second instance for the refresh call itself. Using `client` would send the
// dead access token along and, on failure, trip the interceptor below into
// trying to refresh the refresh.
const plain = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });

client.interceptors.request.use(config => {
  if (config.useToken === false) return config;

  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Several requests can be in flight when the access token expires, and they
// would all try to refresh at once. Holding the promise means the others wait
// on the first instead of spending the refresh token several times over.
let refreshInFlight = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const { data } = await plain.post("/token/refresh/", { refresh });
    if (!data.access) return null;
    setToken(data.access);
    return data.access;
  } catch {
    // A refresh token that is expired, or blacklisted by a password change,
    // ends the session for real.
    return null;
  }
}

function renewAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

function endSession(cause) {
  clearLogin();
  if (window.location.pathname !== "/login") window.location.assign("/login");
  return new Error("Your session has ended. Please log in again.", { cause });
}

// Django REST Framework reports a field error as {"phone": ["..."]} and a
// general one as {"detail": "..."}. Either way the page wants one sentence.
function messageFrom(error) {
  const data = error.response?.data;

  // No response at all: the server is down, or the browser blocked the call.
  // Axios words this "Network Error", which tells a user nothing.
  if (!error.response) {
    return "Could not reach the server. Check that the backend is running, then try again.";
  }

  if (!data) return error.message || "Could not reach the server.";
  if (typeof data === "string") return data;

  const named = data.detail || data.error;
  if (named) return named;

  const first = Object.values(data)[0];
  const message = Array.isArray(first) ? first[0] : first;
  return message || `Request failed (${error.response.status})`;
}

client.interceptors.response.use(
  response => response,
  async error => {
    const request = error.config;
    const unauthorised = error.response?.status === 401;

    // An expired access token is the ordinary case, not a failure: swap it for
    // a fresh one and run the request again. Only once, hence the flag — if the
    // retry is rejected too, the session really is over.
    if (unauthorised && request && request.useToken !== false && !request.retried) {
      const renewed = await renewAccessToken();
      if (!renewed) throw endSession(error);

      request.retried = true;
      request.headers.Authorization = `Bearer ${renewed}`;
      try {
        return await client.request(request);
      } catch (retryError) {
        if (retryError.response?.status === 401) throw endSession(retryError);
        throw new Error(messageFrom(retryError), { cause: retryError });
      }
    }

    if (unauthorised && request?.useToken !== false) throw endSession(error);

    throw new Error(messageFrom(error), { cause: error });
  },
);

const send = async (method, url, data, useToken = true) =>
  (await client.request({ method, url, data, useToken })).data;

export const login = (phone, password) => send("post", "/login/", { phone, password }, false);
export const logout = (refresh) => send("post", "/logout/", { refresh });
export const register = (account) => send("post", "/register/", account);
export const getProfile = () => send("get", "/profile/");
export const updateProfile = (data) => send("patch", "/profile/", data);
export const changePassword = (data) => send("post", "/change-password/", data);
export const requestPasswordReset = (email) => send("post", "/password-reset/", { email }, false);
export const confirmPasswordReset = (data) => send("post", "/password-reset-confirm/", data, false);

const resources = {
  teachers: "/teacher/",
  students: "/student/",
  courses: "/course/",
  enrollments: "/enrollment/",
  lessons: "/lesson/",
  assignments: "/assignment/",
  submissions: "/submission/",
  results: "/results/",
};

export const listResource = (resource) => send("get", resources[resource]);
export const createResource = (resource, data) => send("post", resources[resource], data);
export const updateResource = (resource, id, data) => send("patch", `${resources[resource]}${id}/`, data);
export const deleteResource = (resource, id) => send("delete", `${resources[resource]}${id}/`);
