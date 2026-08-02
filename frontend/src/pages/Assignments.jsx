import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignments, courses, lessons } from "../data.js";
import {
  Button,
  IconButton,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "../components/index.js";

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

function showDateAndTime(text) {
  return new Date(text).toLocaleString();
}

export default function Assignments() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

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
    setDueDate(assignment.due_date.slice(0, 16));
    setCourseId(assignment.course);
    setLessonId(assignment.lesson);
    setDescription(assignment.description);
    setEditingId(assignment.id);
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
      <PageHeader title="Assignments" subtitle="Work set against a lesson." />

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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Input
              label="Due date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />

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

            <Select
              label="Lesson"
              placeholder="Choose a lesson..."
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Description"
            className="mt-4"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

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
            {assignments.length} assignments
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add assignment
          </Button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Course</th>
                <th className="px-3 py-2 font-medium">Lesson</th>
                <th className="px-3 py-2 font-medium">Due</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{assignment.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {assignment.title}
                  </td>
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
