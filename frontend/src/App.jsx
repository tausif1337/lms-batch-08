import { Route, Routes } from "react-router-dom";
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
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
