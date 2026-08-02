// Lessons. Same four steps as StudentsPage — read that file first.
//
// A lesson points at a course by id, so the course list fills the dropdown and
// turns that id back into a title in the table.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { courses, lessons } from "../data";
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
};

export default function LessonsPage() {
  const rows = lessons;

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
      // The <select> compares against strings, so turn the id into one.
      course: String(row.course),
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

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="block max-w-xs truncate text-slate-600">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (row) => courseTitle(row.course),
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
      <PageHeader
        title="Lessons"
        subtitle="The lessons that make up each course."
      />

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit lesson #${editingId}` : "New lesson"}
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
              </div>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create lesson"}
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
        title={`${rows.length} lesson${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add lesson
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No lessons yet." />
      </Card>
    </div>
  );
}
