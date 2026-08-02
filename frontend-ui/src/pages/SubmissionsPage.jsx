// Submissions: the work students hand in for an assignment.
// Same four steps as StudentsPage — read that file first.
//
// A submission points at an assignment and at a student, both by id, so those
// two lists fill the dropdowns and turn the ids back into words in the table.
// The submitted time is display-only, so the form has no field for it.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignments, students, submissions } from "../data";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/ui";

const EMPTY_FORM = {
  assignment: "",
  student: "",
  content: "",
};

export default function SubmissionsPage() {
  const rows = submissions;

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
      // A <select> compares its value as a string, so the ids become strings
      // here or the dropdowns would open on "Select..." instead of the row.
      assignment: String(row.assignment),
      student: String(row.student),
      content: row.content,
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

  const assignmentTitle = (id) =>
    assignments.find((a) => a.id === id)?.title ?? `#${id}`;
  const studentName = (id) => students.find((s) => s.id === id)?.name ?? `#${id}`;

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "assignment",
      label: "Assignment",
      render: (row) => assignmentTitle(row.assignment),
    },
    {
      key: "student",
      label: "Student",
      render: (row) => studentName(row.student),
    },
    {
      key: "content",
      label: "Content",
      // Submitted work can be long, so show only the beginning of it.
      render: (row) => {
        const text = row.content ?? "";
        return text.length > 60 ? `${text.slice(0, 60)}...` : text || "—";
      },
    },
    {
      key: "submitted_at",
      label: "Submitted",
      render: (row) =>
        row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—",
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
      <PageHeader title="Submissions" subtitle="Work handed in by students." />

      {showForm && (
        <div className="mb-6">
          <Card
            title={
              editingId ? `Edit submission #${editingId}` : "New submission"
            }
            action={
              <Button variant="ghost" onClick={closeForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Assignment">
                  <Select
                    value={form.assignment}
                    onChange={(e) => update("assignment", e.target.value)}
                    options={assignments.map((a) => ({
                      value: a.id,
                      label: a.title,
                    }))}
                    placeholder="Select an assignment..."
                  />
                </Field>

                <Field label="Student">
                  <Select
                    value={form.student}
                    onChange={(e) => update("student", e.target.value)}
                    options={students.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder="Select a student..."
                  />
                </Field>
              </div>

              <Field label="Content">
                <Textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => update("content", e.target.value)}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create submission"}
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
        title={`${rows.length} submission${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add submission
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No submissions yet." />
      </Card>
    </div>
  );
}
