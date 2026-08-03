import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { studentsApi } from "../api.js";
import { useAuth } from "../auth.js";
import { useFlash } from "../flash.js";
import { canCreate, canWrite } from "../permissions.js";
import {
  Alert,
  Button,
  Checkbox,
  ConfirmDialog,
  IconButton,
  Input,
  PageHeader,
  Table,
} from "../components/index.js";

// Read this page first. All eight resource pages are the same six steps:
//   1. state for the rows, the form, and the errors
//   2. useEffect()     reads the list from the API when the page opens
//   3. reload()        re-runs that effect after a save or a delete
//   4. handleSave()    creates a new row, or updates the one being edited
//   5. askToDelete() / confirmDelete()  opens the dialog, then deletes
//   6. the JSX: banners, form, table, confirm dialog
export default function Students() {
  // 1. state
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // A short "Saved" line that clears itself after a few seconds.
  const [notice, setNotice] = useFlash();

  // The server enforces this too. Hiding the buttons just keeps the page
  // honest about what will actually work.
  const { user } = useAuth();
  const mayCreate = canCreate(user?.role, "student");
  const mayEdit = canWrite(user?.role, "student");
  const [isSaving, setIsSaving] = useState(false);

  // The row waiting on the confirm dialog, or null when it is closed.
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  // 2. read the list when the page opens. GET /api/student/ returns a plain
  // array, not {count, results}, because this backend has no pagination.
  useEffect(() => {
    async function load() {
      try {
        setStudents(await studentsApi.list());
        setError("");
      } catch (problem) {
        setError(problem.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [reloadCount]);

  function openEmptyForm() {
    setName("");
    setEmail("");
    setRollNumber("");
    setEnrollmentDate("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(student) {
    setName(student.name ?? "");
    setEmail(student.email ?? "");
    setRollNumber(student.roll_number ?? "");
    setEnrollmentDate(student.enrollment_date ?? "");
    setIsActive(student.is_active);
    setEditingId(student.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  // 4. create, or update the row being edited. Student.enrollment_date is a
  // normal editable field here; it is Enrollment.enrollment_date that the
  // server fills in for you.
  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = {
      name,
      email,
      roll_number: rollNumber,
      enrollment_date: enrollmentDate,
      is_active: isActive,
    };

    try {
      if (editingId === 0) {
        await studentsApi.create(values);
        setNotice("Student added.");
      } else {
        await studentsApi.update(editingId, values);
        setNotice("Student updated.");
      }
      setError("");
      closeForm();
      reload();
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  // 5. the trash button only opens the dialog. ConfirmDialog calls the second
  // function once the user has actually agreed.
  function askToDelete(student) {
    setStudentToDelete(student);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await studentsApi.remove(studentToDelete.id);
      setError("");
      setNotice("Student deleted.");
      setStudentToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setStudentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // 6. the JSX
  return (
    <div>
      <PageHeader title="Students" subtitle="Everyone enrolled in the school." />

      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New student" : "Edit student"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label="Roll number"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />

            <Input
              label="Enrollment date"
              type="date"
              required
              value={enrollmentDate}
              onChange={(event) => setEnrollmentDate(event.target.value)}
            />
          </div>

          <Checkbox
            label="Active"
            className="mt-4"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />

          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {isLoading ? "Loading..." : `${students.length} students`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add student
            </Button>
          )}
        </div>

        <Table
          columns={[
            "ID",
            "Name",
            "Email",
            "Roll no.",
            "Enrolled",
            "Active",
            "Action",
          ]}
        >
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{student.id}</td>
              <td className="px-3 py-2 text-slate-700">{student.name}</td>
              <td className="px-3 py-2 text-slate-700">{student.email}</td>
              <td className="px-3 py-2 text-slate-700">
                {student.roll_number}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {student.enrollment_date}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {student.is_active ? "Yes" : "No"}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(student)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(student)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <span className="px-2 text-slate-400">&mdash;</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <ConfirmDialog
        open={studentToDelete !== null}
        title="Delete student"
        message={`Delete ${studentToDelete?.name || "this student"}? Their enrollments and submissions go too. This cannot be undone.`}
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
