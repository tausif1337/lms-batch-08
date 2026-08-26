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
    throw new Error(data.detail || data.error || "Something went wrong");
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