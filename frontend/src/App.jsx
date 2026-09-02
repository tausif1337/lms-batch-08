import { Navigate, Route, Routes } from "react-router-dom";
import { getLoggedInUser } from "./auth.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ListPage from "./pages/ListPage.jsx";

const EVERY_ROLE = ["admin", "teacher", "student"];
const ADMIN_ONLY = ["admin"];
const ADMIN_AND_TEACHER = ["admin", "teacher"];

function RequireLogin({ allowedRoles, children }) {
  const user = getLoggedInUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function listRoute(webAddress, listName, allowedRoles) {
  return (
    <Route
      path={webAddress}
      element={
        <RequireLogin allowedRoles={allowedRoles}>
          <ListPage key={listName} listName={listName} />
        </RequireLogin>
      }
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<PasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <RequireLogin allowedRoles={EVERY_ROLE}>
            <Dashboard />
          </RequireLogin>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireLogin allowedRoles={EVERY_ROLE}>
            <Profile />
          </RequireLogin>
        }
      />
      <Route
        path="/register"
        element={
          <RequireLogin allowedRoles={ADMIN_ONLY}>
            <Register />
          </RequireLogin>
        }
      />

      {listRoute("/teachers", "teachers", ADMIN_ONLY)}
      {listRoute("/students", "students", ADMIN_ONLY)}
      {listRoute("/courses", "courses", EVERY_ROLE)}
      {listRoute("/enrollments", "enrollments", ADMIN_AND_TEACHER)}
      {listRoute("/lessons", "lessons", EVERY_ROLE)}
      {listRoute("/assignments", "assignments", EVERY_ROLE)}
      {listRoute("/submissions", "submissions", EVERY_ROLE)}
      {listRoute("/results", "results", EVERY_ROLE)}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
