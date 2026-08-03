import { useEffect, useState } from "react";
import { AuthContext } from "./auth.js";
import {
  clearSession,
  getSavedUser,
  getToken,
  login as loginRequest,
  register as registerRequest,
  saveSession,
} from "./api.js";

export function AuthProvider({ children }) {
  // The token is read back out of localStorage on the first render so a page
  // refresh does not log you out.
  const [user, setUser] = useState(() => getSavedUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getToken()));

  // api.js fires this event when the backend rejects the token. There is no
  // refresh endpoint, so the session is simply dropped.
  useEffect(() => {
    function handleUnauthorised() {
      setUser(null);
      setIsLoggedIn(false);
    }

    window.addEventListener("lms:unauthorised", handleUnauthorised);
    return () =>
      window.removeEventListener("lms:unauthorised", handleUnauthorised);
  }, []);

  async function logIn(phone, password) {
    const data = await loginRequest(phone, password);

    // The tokens are nested. data.access does not exist.
    const nextUser = { id: data.user_id, username: data.username };
    saveSession(data.tokens.access, nextUser);

    setUser(nextUser);
    setIsLoggedIn(true);
  }

  // Registering does not hand back a token, so log in straight afterwards
  // with the phone number that was just typed.
  async function signUp(details) {
    await registerRequest(details);
    await logIn(details.phone, details.password);
  }

  // There is no logout endpoint. Discarding the token is all the frontend
  // can do; it stays valid on the server until it expires.
  function logOut() {
    clearSession();
    setUser(null);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, logIn, signUp, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
