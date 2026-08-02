import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { courses, teachers } from "../data.js";
import {
  Button,
  IconButton,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "../components/index.js";

function findTeacherName(teacherId) {
  const teacher = teachers.find((item) => item.id === teacherId);
  if (teacher) {
    return teacher.name;
  }
  return "Unknown";
}

export default function Courses() {
  const [title, setTitle] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [description, setDescription] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setTitle("");
    setTeacherId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(course) {
    setTitle(course.title);
    setTeacherId(course.teacher);
    setDescription(course.description);
    setEditingId(course.id);
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
      <PageHeader title="Courses" subtitle="Every course, and who teaches it." />

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New course" : "Edit course"}
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

            <Select
              label="Teacher"
              placeholder="Choose a teacher..."
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
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
            {courses.length} courses
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add course
          </Button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Teacher</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{course.id}</td>
                  <td className="px-3 py-2 text-slate-700">{course.title}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <span className="block max-w-xs truncate">
                      {course.description}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findTeacherName(course.teacher)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <IconButton onClick={() => openFormForEditing(course)}>
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
