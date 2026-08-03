import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.js";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // `state` remembers where you were headed so the login page can send you
    // back there instead of always dropping you on the dashboard.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
