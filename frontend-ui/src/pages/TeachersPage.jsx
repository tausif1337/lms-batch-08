// Teachers. Same four steps as StudentsPage — read that file first.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { teachers } from "../data";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Table,
} from "../components/ui";

const EMPTY_FORM = {
  name: "",
  email: "",
  subject: "",
  is_active: true,
};

export default function TeachersPage() {
  const rows = teachers;

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
      name: row.name,
      email: row.email,
      subject: row.subject,
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

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
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
      <PageHeader title="Teachers" subtitle="The people who teach courses." />

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit teacher #${editingId}` : "New teacher"}
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

                <Field label="Subject">
                  <Input
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
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
                  {editingId ? "Save changes" : "Create teacher"}
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
        title={`${rows.length} teacher${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add teacher
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No teachers yet." />
      </Card>
    </div>
  );
}
