import { useEffect, useState } from "react";

const HANDOFF_KEY = "lms_handoff_notice";

// A message that has to survive both a page change and a sign-out.
//
// Router state cannot carry this. Signing out re-renders whatever page you
// were on inside ProtectedRoute, which fires its own redirect to /login and
// replaces the history entry — throwing away any state that came with it. So
// the message goes somewhere the redirect cannot touch, and the login page
// takes it exactly once.
export function leaveNoticeForLogin(message) {
  sessionStorage.setItem(HANDOFF_KEY, message);
}

export function takeNoticeLeftForLogin() {
  const message = sessionStorage.getItem(HANDOFF_KEY);
  if (message) {
    sessionStorage.removeItem(HANDOFF_KEY);
  }
  return message ?? "";
}

// "Saved", "Updated", "Deleted" — a short message that clears itself, so no
// page has to remember to take it back down.
export function useFlash(millisecondsOnScreen = 4000) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(""), millisecondsOnScreen);
    return () => clearTimeout(timer);
  }, [message, millisecondsOnScreen]);

  return [message, setMessage];
}
