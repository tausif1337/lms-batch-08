import { getToken } from "./auth.js";

const BASE_URL = "http://127.0.0.1:8001/api";


// This function talks to Django
async function request(method, path, body, useToken = true) {

  // Headers tell Django what we are sending
  const headers = {
    "Content-Type": "application/json",
  };


  // If the user is logged in,
  // send their JWT token to Django
  if (useToken) {
    const token = getToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }


  // Send the request to Django
  const response = await fetch(BASE_URL + path, {
    method: method,
    headers: headers,
    body: JSON.stringify(body),
  });


  // Convert Django's response into JavaScript
  const data = await response.json();


  // If Django says something went wrong
  if (!response.ok) {

    // Django REST Framework reports form problems per field, like
    // { "password": ["This password is too common."] }. Those never
    // land in `detail` or `error`, so pull out the first field message
    // instead of falling back to a vague "Something went wrong".
    let message = data.detail || data.error;

    if (!message && data && typeof data === "object") {
      const firstField = Object.values(data)[0];
      message = Array.isArray(firstField) ? firstField[0] : firstField;
    }

    throw new Error(message || "Something went wrong");
  }


  // Give the data back to the function that called request()
  return data;
}


// Login
export function login(phone, password) {

  return request(
    "POST",
    "/login/",
    {
      phone: phone,
      password: password,
    },
    false
  );
}


// Register
export function register(newAccount) {

  return request(
    "POST",
    "/register/",
    newAccount
  );
}