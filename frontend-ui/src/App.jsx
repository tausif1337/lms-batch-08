// This file is the list of addresses (URLs) in the app.
//
// Read it like a table:
//   address "/teachers"  ->  show the Teachers page
//   address "/courses"   ->  show the Courses page
//
// Most pages sit inside <Sidebar>, so they get the menu on the left.
// Login and Register do not, because those screens fill the whole window.

import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

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

export default function App() {
  return (
    <Routes>
      {/* These two fill the whole window, with no menu. */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Everything below shows inside the sidebar frame. */}
      <Route element={<Sidebar />}>
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

      {/* Any address we do not know about sends you back to the dashboard. */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
