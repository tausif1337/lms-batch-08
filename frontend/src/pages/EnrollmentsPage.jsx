// ---------------------------------------------------------------------------
// Enrollments: the link between one student and one course.
//
// Same six steps as StudentsPage. Two things are different here:
//
//   * Two foreign keys. The API sends them as plain numbers
//     ({ "student": 4, "course": 2 }), never as nested objects. So we also
//     load the student list and the course list, show them as dropdowns, and
//     look the names up ourselves when drawing the table.
//
//   * enrollment_date is filled in by the server, so we never send it.
//
// Heads up: the backend has no unique_together on (student, course), so the
// same student CAN be enrolled in the same course twice. Nothing stops it.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { enrollments, students, courses } from "../api";
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Spinner,
  Table,
} from "../components/ui";

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
//
// enrollment_date is NOT here on purpose. The model uses auto_now_add, so
// Django sets it and silently ignores whatever we try to send.
const EMPTY_FORM = {
  student: "",
  course: "",
};

export default function EnrollmentsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // The two parent lists. We need them for the dropdowns AND for turning the
  // id numbers in the table back into readable names.
  const [studentRows, setStudentRows] = useState([]);
  const [courseRows, setCourseRows] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null means "creating"
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- 2. read the lists -----------------------------------------------
  async function load() {
    setLoading(true);
    setError("");
    try {
      // All three requests go out at the same time instead of one after
      // another, so the page appears faster.
      const [enrollmentData, studentData, courseData] = await Promise.all([
        enrollments.list(),
        students.list(),
        courses.list(),
      ]);
      setRows(enrollmentData);
      setStudentRows(studentData);
      setCourseRows(courseData);
    } catch (err) {
      setError(err.text || "Could not load enrollments");
    } finally {
      setLoading(false);
    }
  }

  // ---- 3. run load() once when the page opens --------------------------
  useEffect(() => {
    load();
  }, []);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFieldErrors({});
    setShowForm(true);
  }

  function startEdit(row) {
    // row.student and row.course are numbers. A <select> compares its value as
    // a string, so turn them into strings here or the dropdown looks empty.
    // We turn them back into numbers before sending.
    setForm({
      student: row.student != null ? String(row.student) : "",
      course: row.course != null ? String(row.course) : "",
    });
    setEditingId(row.id);
    setFieldErrors({});
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFieldErrors({});
  }

  // ---- 4. create or update ---------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSaving(true);
    try {
      // Build the payload by hand for two reasons:
      //   * a <select> hands us a STRING ("3"), and Django wants a number
      //   * if nothing was picked the value is '', and Number('') is 0, which
      //     would look like a real id. So we send null instead and let the
      //     backend answer with its own "this field may not be null" message.
      //     (The Select is also required, so the browser normally blocks this
      //     before we ever get here.)
      const payload = {
        student: form.student === "" ? null : Number(form.student),
        course: form.course === "" ? null : Number(form.course),
      };

      if (editingId) {
        await enrollments.update(editingId, payload);
      } else {
        await enrollments.create(payload);
      }
      cancelForm();
      await load(); // refresh the table so it shows the change
    } catch (err) {
      setError(err.text || "Could not save");
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  }

  // ---- 5. delete --------------------------------------------------------
  async function handleDelete(row) {
    if (!window.confirm("Delete this enrollment?")) return;
    setError("");
    try {
      await enrollments.remove(row.id);
      await load();
    } catch (err) {
      setError(err.text || "Could not delete");
    }
  }

  // ---- 6. the screen ----------------------------------------------------

  // The API only gives us the id number, so we find the matching row in the
  // list we loaded above. If it is missing (deleted, say) we show "#4" so the
  // table never goes blank. Student.name is blank=True/null=True on the model,
  // so || is deliberate: it catches '' as well as null.
  const studentName = (id) =>
    studentRows.find((s) => s.id === id)?.name || `Student #${id}`;
  const courseTitle = (id) =>
    courseRows.find((c) => c.id === id)?.title ?? `Course #${id}`;

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
    // Read-only: the server stamps this date when the row is created.
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
            onClick={() => handleDelete(row)}
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

      <Alert kind="error" onClose={() => setError("")}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={
              editingId ? `Edit enrollment #${editingId}` : "New enrollment"
            }
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Each option's value is the student's id, because that is
                    the plain number the backend stores. */}
                <Field label="Student (required)" error={fieldErrors.student}>
                  <Select
                    value={form.student}
                    onChange={(e) => update("student", e.target.value)}
                    placeholder="Choose a student..."
                    options={studentRows.map((s) => ({
                      value: s.id,
                      label: s.name || `Student #${s.id}`,
                    }))}
                    required
                  />
                </Field>

                <Field label="Course (required)" error={fieldErrors.course}>
                  <Select
                    value={form.course}
                    onChange={(e) => update("course", e.target.value)}
                    placeholder="Choose a course..."
                    options={courseRows.map((c) => ({
                      value: c.id,
                      label: c.title,
                    }))}
                    required
                  />
                </Field>
              </div>

              {/* No field for the enrollment date: the server fills it in. */}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create enrollment"}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelForm}>
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
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No enrollments yet." />
        )}
      </Card>
    </div>
  );
}
