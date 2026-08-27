import { Navigate, Route, Routes } from "react-router-dom";
import { getUser } from "./auth.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ResourcePage from "./pages/ResourcePage.jsx";

function Protected({ children, roles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<PasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Protected roles={["admin"]}><Register /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/teachers" element={<Protected roles={["admin"]}><ResourcePage resource="teachers" /></Protected>} />
      <Route path="/students" element={<Protected roles={["admin"]}><ResourcePage resource="students" /></Protected>} />
      <Route path="/courses" element={<Protected roles={["admin", "teacher"]}><ResourcePage resource="courses" /></Protected>} />
      <Route path="/enrollments" element={<Protected roles={["admin", "teacher"]}><ResourcePage resource="enrollments" /></Protected>} />
      <Route path="/lessons" element={<Protected roles={["admin", "teacher"]}><ResourcePage resource="lessons" /></Protected>} />
      <Route path="/assignments" element={<Protected roles={["admin", "teacher"]}><ResourcePage resource="assignments" /></Protected>} />
      <Route path="/submissions" element={<Protected><ResourcePage resource="submissions" /></Protected>} />
      <Route path="/results" element={<Protected roles={["admin", "teacher"]}><ResourcePage resource="results" /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
