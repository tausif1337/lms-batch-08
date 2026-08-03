import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignmentsApi, studentsApi, submissionsApi } from "../api.js";
import { useAuth } from "../auth.js";
import { useFlash } from "../flash.js";
import { canCreate, canWrite } from "../permissions.js";
import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/index.js";

function showDateAndTime(text) {
  if (!text) {
    return "";
  }
  return new Date(text).toLocaleString();
}

function shorten(text) {
  if (!text) {
    return "";
  }
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useFlash();

  // The server enforces this too. Hiding the buttons just keeps the page
  // honest about what will actually work.
  const { user } = useAuth();
  const mayCreate = canCreate(user?.role, "submission");
  const mayEdit = canWrite(user?.role, "submission");
  const [isSaving, setIsSaving] = useState(false);

  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [assignmentId, setAssignmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [content, setContent] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function findAssignmentTitle(assignmentId) {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (assignment) {
      return assignment.title;
    }
    return "Unknown";
  }

  function findStudentName(studentId) {
    const student = students.find((item) => item.id === studentId);
    if (student) {
      return student.name;
    }
    return "Unknown";
  }

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  useEffect(() => {
    async function load() {
      try {
        const [submissionRows, assignmentRows, studentRows] =
          await Promise.all([
            submissionsApi.list(),
            assignmentsApi.list(),
            studentsApi.list(),
          ]);
        setSubmissions(submissionRows);
        setAssignments(assignmentRows);
        setStudents(studentRows);
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
    setAssignmentId("");
    setStudentId("");
    setContent("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(submission) {
    setAssignmentId(String(submission.assignment));
    setStudentId(String(submission.student));
    setContent(submission.content);
    setEditingId(submission.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    // submitted_at is auto_now_add, so the server sets it and ignores
    // anything sent for it. It appears in the table but not in the form.
    const values = {
      assignment: Number(assignmentId),
      student: Number(studentId),
      content,
    };

    try {
      if (editingId === 0) {
        await submissionsApi.create(values);
        setNotice("Submission added.");
      } else {
        await submissionsApi.update(editingId, values);
        setNotice("Submission updated.");
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

  function askToDelete(submission) {
    setSubmissionToDelete(submission);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await submissionsApi.remove(submissionToDelete.id);
      setError("");
      setNotice("Submission deleted.");
      setSubmissionToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setSubmissionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Submissions" subtitle="Work handed in by students." />

      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New submission" : "Edit submission"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Assignment"
              placeholder="Choose an assignment..."
              required
              value={assignmentId}
              onChange={(event) => setAssignmentId(event.target.value)}
            >
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </Select>

            <Select
              label="Student"
              placeholder="Choose a student..."
              required
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Content"
            rows={5}
            className="mt-4"
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
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
            {isLoading ? "Loading..." : `${submissions.length} submissions`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add submission
            </Button>
          )}
        </div>

        <Table
          columns={[
            "ID",
            "Assignment",
            "Student",
            "Content",
            "Submitted",
            "Action",
          ]}
        >
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{submission.id}</td>
              <td className="px-3 py-2 text-slate-700">
                {findAssignmentTitle(submission.assignment)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {findStudentName(submission.student)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {shorten(submission.content)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {showDateAndTime(submission.submitted_at)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(submission)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(submission)}
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
        open={submissionToDelete !== null}
        title="Delete submission"
        message={
          submissionToDelete
            ? `Delete ${findStudentName(submissionToDelete.student)}'s work on ${findAssignmentTitle(submissionToDelete.assignment)}? Its result goes too. This cannot be undone.`
            : ""
        }
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setSubmissionToDelete(null)}
      />
    </div>
  );
}
