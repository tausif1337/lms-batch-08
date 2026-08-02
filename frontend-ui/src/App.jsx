// Every URL in the app is listed here.
//
// This is the UI-only build: there is no auth, so nothing is gated. The login
// and register screens are just two more pages you can walk into and out of.

import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import CoursesPage from "./pages/CoursesPage";
import EnrollmentsPage from "./pages/EnrollmentsPage";
import LessonsPage from "./pages/LessonsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      {/* Standalone screens: no sidebar around them. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Everything else sits inside the sidebar frame. */}
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/enrollments" element={<EnrollmentsPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Route>

      {/* Anything unknown goes home. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
