// ---------------------------------------------------------------------------
// THE PATTERN PAGE.
//
// Every resource page in this UI-only build is the same four steps:
//   1. rows come straight from the static list in data.js
//   2. local state remembers whether the form panel is open, and what is typed
//      into it
//   3. Add / Edit open the panel; Save and Cancel close it again
//   4. the JSX: form panel, then table
//
// Nothing is stored. Saving closes the panel and the table is unchanged,
// because there is no backend and data.js is never written to. The Delete
// button is decorative for the same reason.
//
// Read this file first. The others will then look familiar.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { students } from "../data";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Table,
} from "../components/ui";

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
const EMPTY_FORM = {
  name: "",
  email: "",
  enrollment_date: "",
  roll_number: "",
  is_active: true,
};

export default function StudentsPage() {
  // ---- 1. the rows -------------------------------------------------------
  const rows = students;

  // ---- 2. form state -----------------------------------------------------
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null means "creating"
  const [showForm, setShowForm] = useState(false);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ---- 3. open and close the panel ---------------------------------------
  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(row) {
    setForm({
      name: row.name,
      email: row.email,
      enrollment_date: row.enrollment_date,
      roll_number: row.roll_number,
      is_active: row.is_active,
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

  // ---- 4. the screen ------------------------------------------------------
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "roll_number", label: "Roll no." },
    { key: "enrollment_date", label: "Enrolled" },
    {
      key: "is_active",
      label: "Active",
      render: (row) => (row.is_active ? "Yes" : "No"),
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
        title="Students"
        subtitle="Everyone enrolled in the school."
      />

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit student #${editingId}` : "New student"}
            action={
              <Button variant="ghost" onClick={closeForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </Field>

                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>

                <Field label="Roll number">
                  <Input
                    value={form.roll_number}
                    onChange={(e) => update("roll_number", e.target.value)}
                  />
                </Field>

                <Field label="Enrollment date">
                  <Input
                    type="date"
                    value={form.enrollment_date}
                    onChange={(e) => update("enrollment_date", e.target.value)}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active
              </label>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create student"}
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
        title={`${rows.length} student${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add student
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No students yet." />
      </Card>
    </div>
  );
}
