import { useEffect, useState } from "react";

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
