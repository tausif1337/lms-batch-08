import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { teachersApi } from "../api.js";
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

// Every resource page follows the same six steps:
//   1. state for the rows, the form, and the errors
//   2. useEffect()     reads the list from the API when the page opens
//   3. reload()        re-runs that effect after a save or a delete
//   4. handleSave()    creates a new row, or updates the one being edited
//   5. askToDelete() / confirmDelete()  opens the dialog, then deletes
//   6. the JSX: banners, form, table, confirm dialog
export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useFlash();

  // The server enforces this too. Hiding the buttons just keeps the page
  // honest about what will actually work.
  const { user } = useAuth();
  const mayCreate = canCreate(user?.role, "teacher");
  const mayEdit = canWrite(user?.role, "teacher");
  const [isSaving, setIsSaving] = useState(false);

  // The row waiting on the confirm dialog, or null when it is closed.
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  useEffect(() => {
    async function load() {
      try {
        // The list endpoint is not paginated, so this is a plain array.
        setTeachers(await teachersApi.list());
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
    setSubject("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(teacher) {
    setName(teacher.name ?? "");
    setEmail(teacher.email ?? "");
    setSubject(teacher.subject ?? "");
    setIsActive(teacher.is_active);
    setEditingId(teacher.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = { name, email, subject, is_active: isActive };

    try {
      if (editingId === 0) {
        await teachersApi.create(values);
        setNotice("Teacher added.");
      } else {
        await teachersApi.update(editingId, values);
        setNotice("Teacher updated.");
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

  function askToDelete(teacher) {
    setTeacherToDelete(teacher);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await teachersApi.remove(teacherToDelete.id);
      setError("");
      setNotice("Teacher deleted.");
      setTeacherToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setTeacherToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Teachers" subtitle="The people who teach courses." />

      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New teacher" : "Edit teacher"}
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
              label="Subject"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
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
            {isLoading ? "Loading..." : `${teachers.length} teachers`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add teacher
            </Button>
          )}
        </div>

        <Table columns={["ID", "Name", "Email", "Subject", "Active", "Action"]}>
          {teachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{teacher.id}</td>
              <td className="px-3 py-2 text-slate-700">{teacher.name}</td>
              <td className="px-3 py-2 text-slate-700">{teacher.email}</td>
              <td className="px-3 py-2 text-slate-700">{teacher.subject}</td>
              <td className="px-3 py-2 text-slate-700">
                {teacher.is_active ? "Yes" : "No"}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(teacher)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(teacher)}
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
        open={teacherToDelete !== null}
        title="Delete teacher"
        message={`Delete ${teacherToDelete?.name || "this teacher"}? Their courses go too. This cannot be undone.`}
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setTeacherToDelete(null)}
      />
    </div>
  );
}
