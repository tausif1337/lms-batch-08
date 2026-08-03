import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignmentsApi, coursesApi, lessonsApi } from "../api.js";
import {
  Alert,
  Button,
  IconButton,
  Input,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/index.js";

function showDateAndTime(text) {
  if (!text) {
    return "";
  }
  return new Date(text).toLocaleString();
}

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time, but
// the API sends UTC ("2026-08-15T23:59:00Z"). Slicing the string straight
// off would show the UTC clock time, so the offset is taken off first.
function toDateTimeInputValue(text) {
  if (!text) {
    return "";
  }
  const moment = new Date(text);
  const offsetInMs = moment.getTimezoneOffset() * 60 * 1000;
  return new Date(moment.getTime() - offsetInMs).toISOString().slice(0, 16);
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function findCourseTitle(courseId) {
    const course = courses.find((item) => item.id === courseId);
    if (course) {
      return course.title;
    }
    return "Unknown";
  }

  function findLessonTitle(lessonId) {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return lesson.title;
    }
    return "Unknown";
  }

  // An assignment points at both a course and a lesson, so once a course is
  // chosen only that course's lessons are worth offering.
  const lessonsToOffer = courseId
    ? lessons.filter((lesson) => lesson.course === Number(courseId))
    : lessons;

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  useEffect(() => {
    async function load() {
      try {
        const [assignmentRows, courseRows, lessonRows] = await Promise.all([
          assignmentsApi.list(),
          coursesApi.list(),
          lessonsApi.list(),
        ]);
        setAssignments(assignmentRows);
        setCourses(courseRows);
        setLessons(lessonRows);
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
    setTitle("");
    setDueDate("");
    setCourseId("");
    setLessonId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(assignment) {
    setTitle(assignment.title);
    setDueDate(toDateTimeInputValue(assignment.due_date));
    setCourseId(String(assignment.course));
    setLessonId(String(assignment.lesson));
    setDescription(assignment.description);
    setEditingId(assignment.id);
    setFormIsOpen(true);
  }

  // Changing the course clears a lesson that no longer belongs to it.
  function handleCourseChange(nextCourseId) {
    setCourseId(nextCourseId);

    const lesson = lessons.find((item) => item.id === Number(lessonId));
    if (lesson && lesson.course !== Number(nextCourseId)) {
      setLessonId("");
    }
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      // toISOString() throws on an unparseable date, so this has to happen
      // inside the try or the button would stay stuck on "Saving...".
      const due = new Date(dueDate);
      if (Number.isNaN(due.getTime())) {
        throw new Error("Enter a due date.");
      }

      const values = {
        title,
        description,
        course: Number(courseId),
        lesson: Number(lessonId),
        // The input gives local time. Send UTC so the server stores the
        // moment that was actually meant.
        due_date: due.toISOString(),
      };

      if (editingId === 0) {
        await assignmentsApi.create(values);
      } else {
        await assignmentsApi.update(editingId, values);
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

  async function handleDelete(assignment) {
    const ok = window.confirm(
      `Delete ${assignment.title}? Its submissions go too.`,
    );
    if (!ok) {
      return;
    }

    try {
      await assignmentsApi.remove(assignment.id);
      setError("");
      reload();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Work set against a lesson." />

      <Alert>{error}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New assignment" : "Edit assignment"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Input
              label="Due date"
              type="datetime-local"
              required
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />

            <Select
              label="Course"
              placeholder="Choose a course..."
              required
              value={courseId}
              onChange={(event) => handleCourseChange(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>

            <Select
              label="Lesson"
              placeholder="Choose a lesson..."
              required
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
            >
              {lessonsToOffer.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            className="mt-4"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

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
            {isLoading ? "Loading..." : `${assignments.length} assignments`}
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add assignment
          </Button>
        </div>

        <Table columns={["ID", "Title", "Course", "Lesson", "Due", "Action"]}>
          {assignments.map((assignment) => (
            <tr
              key={assignment.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{assignment.id}</td>
              <td className="px-3 py-2 text-slate-700">{assignment.title}</td>
              <td className="px-3 py-2 text-slate-700">
                {findCourseTitle(assignment.course)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {findLessonTitle(assignment.lesson)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {showDateAndTime(assignment.due_date)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <IconButton onClick={() => openFormForEditing(assignment)}>
                    <Pencil size={14} />
                  </IconButton>

                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(assignment)}
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
