// Courses. Same four steps as StudentsPage — read that file first.
//
// A course points at a teacher by id, so this page also reads the teacher list
// to fill the dropdown and to turn that id back into a name in the table.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { courses, teachers } from "../data";
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

// teacher starts as '' because that is what an unchosen <select> holds.
const EMPTY_FORM = {
  title: "",
  description: "",
  teacher: "",
};

export default function CoursesPage() {
  const rows = courses;

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
      // A <select> compares its value as a string, so the id becomes one here
      // or the dropdown would open on the placeholder.
      teacher: String(row.teacher),
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

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.name }));
  const teacherName = (id) => teachers.find((t) => t.id === id)?.name ?? `#${id}`;

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    {
      key: "description",
      label: "Description",
      // Descriptions can be long. Cut them off so one row cannot stretch the
      // whole table sideways. The full text is in the tooltip.
      render: (row) => (
        <span className="block max-w-xs truncate" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      key: "teacher",
      label: "Teacher",
      render: (row) => teacherName(row.teacher),
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
        title="Courses"
        subtitle="Every course, and who teaches it."
      />

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit course #${editingId}` : "New course"}
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

                <Field label="Teacher">
                  <Select
                    options={teacherOptions}
                    placeholder="Choose a teacher..."
                    value={form.teacher}
                    onChange={(e) => update("teacher", e.target.value)}
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
                  {editingId ? "Save changes" : "Create course"}
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
        title={`${rows.length} course${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add course
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No courses yet." />
      </Card>
    </div>
  );
}
