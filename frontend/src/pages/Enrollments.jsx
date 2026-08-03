import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { coursesApi, enrollmentsApi, studentsApi } from "../api.js";
import {
  Alert,
  Button,
  IconButton,
  PageHeader,
  Select,
  Table,
} from "../components/index.js";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

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

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // Three endpoints, because the enrollment rows only carry ids.
  useEffect(() => {
    async function load() {
      try {
        const [enrollmentRows, studentRows, courseRows] = await Promise.all([
          enrollmentsApi.list(),
          studentsApi.list(),
          coursesApi.list(),
        ]);
        setEnrollments(enrollmentRows);
        setStudents(studentRows);
        setCourses(courseRows);
        setError("");
      } catch (problem) {
        setError(problem.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [reloadCount]);

  function openEmptyForm() {
    setStudentId("");
    setCourseId("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(enrollment) {
    setStudentId(String(enrollment.student));
    setCourseId(String(enrollment.course));
    setEditingId(enrollment.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    // enrollment_date is auto_now_add on the server. Sending it is silently
    // ignored, so it is shown in the table but never in the form.
    const values = { student: Number(studentId), course: Number(courseId) };

    try {
      if (editingId === 0) {
        await enrollmentsApi.create(values);
      } else {
        await enrollmentsApi.update(editingId, values);
      }
      setError("");
      closeForm();
      reload();
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(enrollment) {
    const ok = window.confirm("Delete this enrollment?");
    if (!ok) {
      return;
    }

    try {
      await enrollmentsApi.remove(enrollment.id);
      setError("");
      reload();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Which student is taking which course."
      />

      <Alert>{error}</Alert>

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
              required
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
              required
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {isLoading ? "Loading..." : `${enrollments.length} enrollments`}
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add enrollment
          </Button>
        </div>

        <Table columns={["ID", "Student", "Course", "Enrolled", "Action"]}>
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

                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(enrollment)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
