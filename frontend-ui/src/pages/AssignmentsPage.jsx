// Assignments. Same four steps as StudentsPage — read that file first.
//
// An assignment points at a course and at a lesson, both by id, so those two
// lists fill the dropdowns and turn the ids back into titles in the table.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignments, courses, lessons } from "../data";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/ui";

const EMPTY_FORM = {
  title: "",
  description: "",
  course: "",
  lesson: "",
  due_date: "",
};

export default function AssignmentsPage() {
  const rows = assignments;

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(row) {
    setForm({
      title: row.title,
      description: row.description,
      // The ids are numbers, but a <select> value has to be a string,
      // otherwise the dropdown shows the placeholder instead of the row.
      course: String(row.course),
      lesson: String(row.lesson),
      // <input type="datetime-local"> wants exactly "YYYY-MM-DDTHH:MM".
      due_date: row.due_date.slice(0, 16),
    });
    setEditingId(row.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    closeForm();
  }

  const courseTitle = (id) => courses.find((c) => c.id === id)?.title ?? `#${id}`;
  const lessonTitle = (id) => lessons.find((l) => l.id === id)?.title ?? `#${id}`;
  const dueDate = (value) => (value ? new Date(value).toLocaleString() : "—");

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    {
      key: "course",
      label: "Course",
      render: (row) => courseTitle(row.course),
    },
    {
      key: "lesson",
      label: "Lesson",
      render: (row) => lessonTitle(row.lesson),
    },
    {
      key: "due_date",
      label: "Due",
      render: (row) => dueDate(row.due_date),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" onClick={() => startEdit(row)} title="Edit">
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            title="Delete"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Work set against a lesson." />

      {showForm && (
        <div className="mb-6">
          <Card
            title={
              editingId ? `Edit assignment #${editingId}` : "New assignment"
            }
            action={
              <Button variant="ghost" onClick={closeForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </Field>

                <Field label="Due date">
                  <Input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => update("due_date", e.target.value)}
                  />
                </Field>

                <Field label="Course">
                  <Select
                    value={form.course}
                    onChange={(e) => update("course", e.target.value)}
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.title,
                    }))}
                    placeholder="Select a course..."
                  />
                </Field>

                <Field label="Lesson">
                  <Select
                    value={form.lesson}
                    onChange={(e) => update("lesson", e.target.value)}
                    options={lessons.map((l) => ({
                      value: l.id,
                      label: l.title,
                    }))}
                    placeholder="Select a lesson..."
                  />
                </Field>
              </div>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create assignment"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card
        title={`${rows.length} assignment${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add assignment
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No assignments yet." />
      </Card>
    </div>
  );
}
