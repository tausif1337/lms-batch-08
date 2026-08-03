import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.js";

// `role`, when given, is the one role allowed through. Hiding a link in the
// sidebar is not enough on its own — somebody can always type the URL.
export default function ProtectedRoute({ role, children }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // `state` remembers where you were headed so the login page can send you
    // back there instead of always dropping you on the dashboard.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // The role arrives a moment after the token when a saved session is being
  // topped up from /profile/. Waiting avoids bouncing the user by mistake.
  if (role && !user?.role) {
    return null;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
