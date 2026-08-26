import { useEffect, useState } from "react";
import { AuthContext } from "./auth.js";
import {
  clearSession,
  fetchProfile,
  getSavedUser,
  getToken,
  login as loginRequest,
  saveSession,
} from "./api.js";

export function AuthProvider({ children }) {
  // These are lazy initialisers -- the arrow function runs once, on the very
  // first render, and reads localStorage back. That is the whole reason a
  // page refresh does not log you out.
  const [user, setUser] = useState(() => getSavedUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getToken()));

  // api.js fires this event when the backend rejects the token. There is no
  // refresh endpoint, so the session is simply dropped and ProtectedRoute
  // sends the person back to /login.
  useEffect(() => {
    function handleUnauthorised() {
      setUser(null);
      setIsLoggedIn(false);
    }

    window.addEventListener("lms:unauthorised", handleUnauthorised);
    return () =>
      window.removeEventListener("lms:unauthorised", handleUnauthorised);
  }, []);

  // A session saved before roles existed has no role on it. Rather than treat
  // that account as having no permissions, ask /profile/ what it is.
  useEffect(() => {
    if (!isLoggedIn || user?.role) {
      return;
    }

    let stillMounted = true;

    async function fillInTheRole() {
      try {
        const data = await fetchProfile();
        if (!stillMounted) {
          return;
        }
        const nextUser = {
          id: data.user.user_id,
          username: data.user.username,
          role: data.user.role,
        };
        saveSession(getToken(), nextUser);
        setUser(nextUser);
      } catch {
        // A dead token is already handled by api.js; nothing to add here.
      }
    }

    fillInTheRole();
    return () => {
      stillMounted = false;
    };
  }, [isLoggedIn, user?.role]);

  async function logIn(phone, password) {
    const data = await loginRequest(phone, password);

    // THE ONE TO REMEMBER: the tokens are nested. data.access does not exist.
    const nextUser = {
      id: data.user_id,
      username: data.username,
      role: data.role,
    };
    saveSession(data.tokens.access, nextUser);

    setUser(nextUser);
    setIsLoggedIn(true);
  }

  // There is no logout endpoint on this backend. Throwing the token away is
  // all the frontend can do; it stays valid on the server until it expires.
  function logOut() {
    clearSession();
    setUser(null);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
