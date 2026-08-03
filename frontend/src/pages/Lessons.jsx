import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { coursesApi, lessonsApi } from "../api.js";
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

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
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

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // There is no filtering on this API, so "lessons in course 3" is not a
  // request you can make. Both lists download in full and are joined here.
  useEffect(() => {
    async function load() {
      try {
        const [lessonRows, courseRows] = await Promise.all([
          lessonsApi.list(),
          coursesApi.list(),
        ]);
        setLessons(lessonRows);
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
    setTitle("");
    setCourseId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(lesson) {
    setTitle(lesson.title);
    setCourseId(String(lesson.course));
    setDescription(lesson.description);
    setEditingId(lesson.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = { title, description, course: Number(courseId) };

    try {
      if (editingId === 0) {
        await lessonsApi.create(values);
      } else {
        await lessonsApi.update(editingId, values);
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

  async function handleDelete(lesson) {
    const ok = window.confirm(
      `Delete ${lesson.title}? Its assignments go too.`,
    );
    if (!ok) {
      return;
    }

    try {
      await lessonsApi.remove(lesson.id);
      setError("");
      reload();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Lessons"
        subtitle="The lessons that make up each course."
      />

      <Alert>{error}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New lesson" : "Edit lesson"}
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
            {isLoading ? "Loading..." : `${lessons.length} lessons`}
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add lesson
          </Button>
        </div>

        <Table columns={["ID", "Title", "Description", "Course", "Action"]}>
          {lessons.map((lesson) => (
            <tr
              key={lesson.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{lesson.id}</td>
              <td className="px-3 py-2 text-slate-700">{lesson.title}</td>
              <td className="px-3 py-2 text-slate-700">
                <span className="block max-w-xs truncate">
                  {lesson.description}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-700">
                {findCourseTitle(lesson.course)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <IconButton onClick={() => openFormForEditing(lesson)}>
                    <Pencil size={14} />
                  </IconButton>

                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(lesson)}
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
