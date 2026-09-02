import {
  forgetLoggedInUser,
  getAccessToken,
  getRefreshToken,
  saveNewAccessToken,
} from "./auth.js";

const SERVER_ADDRESS = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

const COULD_NOT_REACH_SERVER =
  "Could not reach the server. Check that the backend is running, then try again.";

async function sendToServer(method, address, dataToSend, accessToken) {
  const settings = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (accessToken) {
    settings.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (dataToSend !== undefined) {
    settings.body = JSON.stringify(dataToSend);
  }

  try {
    return await fetch(`${SERVER_ADDRESS}${address}`, settings);
  } catch {
    throw new Error(COULD_NOT_REACH_SERVER);
  }
}

async function readAnswer(answer) {
  const text = await answer.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readableErrorMessage(answerBody, statusCode) {
  const requestFailed = `Request failed (${statusCode})`;

  if (!answerBody) {
    return requestFailed;
  }

  if (typeof answerBody === "string") {
    return answerBody;
  }

  if (answerBody.detail) {
    return answerBody.detail;
  }

  if (answerBody.error) {
    return answerBody.error;
  }

  const firstProblem = Object.values(answerBody)[0];

  if (Array.isArray(firstProblem) && firstProblem.length > 0) {
    return firstProblem[0];
  }

  if (firstProblem) {
    return firstProblem;
  }

  return requestFailed;
}

async function askServerForNewAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  let answer;

  try {
    answer = await sendToServer("POST", "/token/refresh/", { refresh: refreshToken }, null);
  } catch {
    return null;
  }

  if (!answer.ok) {
    return null;
  }

  const answerBody = await readAnswer(answer);

  if (!answerBody?.access) {
    return null;
  }

  saveNewAccessToken(answerBody.access);

  return answerBody.access;
}

let newAccessTokenRequest = null;

function getNewAccessTokenOnceForEveryone() {
  if (!newAccessTokenRequest) {
    newAccessTokenRequest = askServerForNewAccessToken().finally(() => {
      newAccessTokenRequest = null;
    });
  }

  return newAccessTokenRequest;
}

function logOutAndGoToLoginPage() {
  forgetLoggedInUser();

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }

  return new Error("Your session has ended. Please log in again.");
}

async function askServer(method, address, dataToSend, sendLoginToken = true) {
  const accessToken = sendLoginToken ? getAccessToken() : null;

  let answer = await sendToServer(method, address, dataToSend, accessToken);

  const loginWasRejected = answer.status === 401;

  if (loginWasRejected && sendLoginToken) {
    const newAccessToken = await getNewAccessTokenOnceForEveryone();

    if (!newAccessToken) {
      throw logOutAndGoToLoginPage();
    }

    answer = await sendToServer(method, address, dataToSend, newAccessToken);

    if (answer.status === 401) {
      throw logOutAndGoToLoginPage();
    }
  }

  const answerBody = await readAnswer(answer);

  if (!answer.ok) {
    throw new Error(readableErrorMessage(answerBody, answer.status));
  }

  return answerBody;
}

export function login(phone, password) {
  return askServer("POST", "/login/", { phone, password }, false);
}

export function logout(refreshToken) {
  return askServer("POST", "/logout/", { refresh: refreshToken });
}

export function register(newAccount) {
  return askServer("POST", "/register/", newAccount);
}

export function getMyProfile() {
  return askServer("GET", "/profile/");
}

export function updateMyProfile(details) {
  return askServer("PATCH", "/profile/", details);
}

export function changeMyPassword(passwords) {
  return askServer("POST", "/change-password/", passwords);
}

export function requestPasswordResetEmail(email) {
  return askServer("POST", "/password-reset/", { email }, false);
}

export function setNewPasswordFromEmailLink(details) {
  return askServer("POST", "/password-reset-confirm/", details, false);
}

const SERVER_ADDRESS_OF_EACH_LIST = {
  teachers: "/teacher/",
  students: "/student/",
  courses: "/course/",
  enrollments: "/enrollment/",
  lessons: "/lesson/",
  assignments: "/assignment/",
  submissions: "/submission/",
  results: "/results/",
};

export function getList(listName) {
  return askServer("GET", SERVER_ADDRESS_OF_EACH_LIST[listName]);
}

export function addToList(listName, newRecord) {
  return askServer("POST", SERVER_ADDRESS_OF_EACH_LIST[listName], newRecord);
}

export function updateInList(listName, recordId, changes) {
  return askServer("PATCH", `${SERVER_ADDRESS_OF_EACH_LIST[listName]}${recordId}/`, changes);
}

export function deleteFromList(listName, recordId) {
  return askServer("DELETE", `${SERVER_ADDRESS_OF_EACH_LIST[listName]}${recordId}/`);
}
