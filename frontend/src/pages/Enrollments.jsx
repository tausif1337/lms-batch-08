import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { courses, enrollments, students } from "../data.js";
import {
  Button,
  IconButton,
  PageHeader,
  Select,
} from "../components/index.js";

function findStudentName(studentId) {
  const student = students.find((item) => item.id === studentId);
  if (student) {
    return student.name;
  }
  return "Unknown";
}

function findCourseTitle(courseId) {
  const course = courses.find((item) => item.id === courseId);
  if (course) {
    return course.title;
  }
  return "Unknown";
}

export default function Enrollments() {
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setStudentId("");
    setCourseId("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(enrollment) {
    setStudentId(enrollment.student);
    setCourseId(enrollment.course);
    setEditingId(enrollment.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Which student is taking which course."
      />

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New enrollment" : "Edit enrollment"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Student"
              placeholder="Choose a student..."
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Select>

            <Select
              label="Course"
              placeholder="Choose a course..."
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4 flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {enrollments.length} enrollments
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add enrollment
          </Button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Course</th>
                <th className="px-3 py-2 font-medium">Enrolled</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{enrollment.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {findStudentName(enrollment.student)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findCourseTitle(enrollment.course)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {enrollment.enrollment_date}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <IconButton onClick={() => openFormForEditing(enrollment)}>
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton variant="danger">
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
