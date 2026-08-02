// Enrollments: the link between one student and one course.
// Same four steps as StudentsPage — read that file first.
//
// Two id columns here, so the student list and the course list are both read
// to fill the dropdowns and to print names in the table. The enrollment date
// is display-only, which is why the form has no field for it.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { courses, enrollments, students } from "../data";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Table,
} from "../components/ui";

const EMPTY_FORM = {
  student: "",
  course: "",
};

export default function EnrollmentsPage() {
  const rows = enrollments;

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
    // A <select> compares its value as a string, so the ids become strings
    // here or both dropdowns would open on their placeholder.
    setForm({
      student: String(row.student),
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

  const studentName = (id) => students.find((s) => s.id === id)?.name ?? `#${id}`;
  const courseTitle = (id) => courses.find((c) => c.id === id)?.title ?? `#${id}`;

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "student",
      label: "Student",
      render: (row) => studentName(row.student),
    },
    {
      key: "course",
      label: "Course",
      render: (row) => courseTitle(row.course),
    },
    { key: "enrollment_date", label: "Enrolled" },
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
        title="Enrollments"
        subtitle="Which student is taking which course."
      />

      {showForm && (
        <div className="mb-6">
          <Card
            title={
              editingId ? `Edit enrollment #${editingId}` : "New enrollment"
            }
            action={
              <Button variant="ghost" onClick={closeForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Student">
                  <Select
                    value={form.student}
                    onChange={(e) => update("student", e.target.value)}
                    placeholder="Choose a student..."
                    options={students.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                  />
                </Field>

                <Field label="Course">
                  <Select
                    value={form.course}
                    onChange={(e) => update("course", e.target.value)}
                    placeholder="Choose a course..."
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.title,
                    }))}
                  />
                </Field>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create enrollment"}
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
        title={`${rows.length} enrollment${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add enrollment
            </Button>
          )
        }
      >
        <Table columns={columns} rows={rows} empty="No enrollments yet." />
      </Card>
    </div>
  );
}
