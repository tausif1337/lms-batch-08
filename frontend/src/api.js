import { clearLogin, getToken } from "./auth.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

async function request(method, path, body, useToken = true) {
  const headers = { "Content-Type": "application/json" };
  if (useToken) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body !== undefined && body !== null) options.body = JSON.stringify(body);

  const response = await fetch(BASE_URL + path, options);
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }

  if (response.status === 401 && useToken) clearLogin();
  if (!response.ok) {
    let message = data.detail || data.error;
    if (!message && data && typeof data === "object") {
      const first = Object.values(data)[0];
      message = Array.isArray(first) ? first[0] : first;
    }
    throw new Error(message || `Request failed (${response.status})`);
  }
  return data;
}

export const login = (phone, password) => request("POST", "/login/", { phone, password }, false);
export const register = (account) => request("POST", "/register/", account);
export const getProfile = () => request("GET", "/profile/");
export const updateProfile = (data) => request("PATCH", "/profile/", data);
export const changePassword = (data) => request("POST", "/change-password/", data);
export const requestPasswordReset = (email) => request("POST", "/password-reset/", { email }, false);
export const confirmPasswordReset = (data) => request("POST", "/password-reset-confirm/", data, false);

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

export async function listResource(resource) {
  return request("GET", resources[resource]);
}
export async function createResource(resource, data) {
  return request("POST", resources[resource], data);
}
export async function updateResource(resource, id, data) {
  return request("PATCH", `${resources[resource]}${id}/`, data);
}
export async function deleteResource(resource, id) {
  return request("DELETE", `${resources[resource]}${id}/`);
}
