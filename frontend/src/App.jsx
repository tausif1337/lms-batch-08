import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { ProtectedRoute } from "./components/index.js";

import Dashboard from "./pages/Dashboard.jsx";
import Teachers from "./pages/Teachers.jsx";
import Students from "./pages/Students.jsx";
import Courses from "./pages/Courses.jsx";
import Enrollments from "./pages/Enrollments.jsx";
import Lessons from "./pages/Lessons.jsx";
import Assignments from "./pages/Assignments.jsx";
import Submissions from "./pages/Submissions.jsx";
import Results from "./pages/Results.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Accounts from "./pages/Accounts.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* The two halves of the password reset. Both are public: somebody who
          has forgotten their password cannot be signed in to reach them. */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* /register used to be a public page. There is no public sign-up any
          more: an admin creates accounts at /accounts, inside the app. */}
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* Every page inside the sidebar needs a token. Without one,
          ProtectedRoute sends you to /login. */}
      <Route
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/enrollments" element={<Enrollments />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/results" element={<Results />} />

        {/* Your own account. Every role gets this one. */}
        <Route path="/profile" element={<Profile />} />

        {/* Admins only, and the API refuses everyone else regardless. */}
        <Route
          path="/accounts"
          element={
            <ProtectedRoute role="admin">
              <Accounts />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
