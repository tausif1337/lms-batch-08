import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  assignmentsApi,
  resultsApi,
  studentsApi,
  submissionsApi,
} from "../api.js";
import { useAuth } from "../auth.js";
import { useFlash } from "../flash.js";
import { canCreate, canWrite } from "../permissions.js";
import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  Input,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/index.js";

function shorten(text) {
  if (!text) {
    return "";
  }
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useFlash();

  // The server enforces this too. Hiding the buttons just keeps the page
  // honest about what will actually work.
  const { user } = useAuth();
  const mayCreate = canCreate(user?.role, "results");
  const mayEdit = canWrite(user?.role, "results");
  const [isSaving, setIsSaving] = useState(false);

  const [resultToDelete, setResultToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [submissionId, setSubmissionId] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  // "Submission #4" on its own says nothing useful, so the student and the
  // assignment are looked up and folded into the label.
  function describeSubmission(submissionId) {
    const submission = submissions.find((item) => item.id === submissionId);
    if (!submission) {
      return `Submission #${submissionId}`;
    }

    const student = students.find((item) => item.id === submission.student);
    const assignment = assignments.find(
      (item) => item.id === submission.assignment,
    );

    const who = student ? student.name : "Unknown student";
    const what = assignment ? assignment.title : "Unknown assignment";
    return `#${submission.id} — ${who}, ${what}`;
  }

  // Results.submission is one-to-one: a submission can only be graded once,
  // and a second attempt comes back as a 400. Already-graded submissions are
  // left out of the "new result" dropdown so that is hard to walk into.
  const gradedIds = results
    .filter((result) => result.id !== editingId)
    .map((result) => result.submission);

  const submissionsToOffer = submissions.filter(
    (submission) => !gradedIds.includes(submission.id),
  );

  // Bumping this re-runs the effect below. Saving and deleting call reload()
  // so the table shows what the server now holds.
  const [reloadCount, setReloadCount] = useState(0);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  useEffect(() => {
    async function load() {
      try {
        const [resultRows, submissionRows, studentRows, assignmentRows] =
          await Promise.all([
            resultsApi.list(),
            submissionsApi.list(),
            studentsApi.list(),
            assignmentsApi.list(),
          ]);
        setResults(resultRows);
        setSubmissions(submissionRows);
        setStudents(studentRows);
        setAssignments(assignmentRows);
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
    setSubmissionId("");
    setScore("");
    setFeedback("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(result) {
    setSubmissionId(String(result.submission));
    setScore(String(result.score));
    setFeedback(result.feedback);
    setEditingId(result.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    const values = {
      submission: Number(submissionId),
      score: Number(score),
      feedback,
    };

    try {
      if (editingId === 0) {
        await resultsApi.create(values);
        setNotice("Result added.");
      } else {
        await resultsApi.update(editingId, values);
        setNotice("Result updated.");
      }
      setError("");
      closeForm();
      reload();
    } catch (problem) {
      // The one-to-one clash comes back as "submission: results with this
      // submission already exists", which reads badly. Say it plainly.
      if (problem.message.includes("already exists")) {
        setError("That submission has already been graded. Edit its result instead.");
      } else {
        setError(problem.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function askToDelete(result) {
    setResultToDelete(result);
  }

  async function confirmDelete() {
    setIsDeleting(true);

    try {
      await resultsApi.remove(resultToDelete.id);
      setError("");
      setNotice("Result deleted.");
      setResultToDelete(null);
      reload();
    } catch (problem) {
      setError(problem.message);
      setResultToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Scores and feedback for submitted work."
      />

      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New result" : "Edit result"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Submission"
              placeholder="Choose a submission..."
              required
              value={submissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
            >
              {submissionsToOffer.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {describeSubmission(submission.id)}
                </option>
              ))}
            </Select>

            <Input
              label="Score"
              type="number"
              step="0.01"
              required
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>

          <Textarea
            label="Feedback"
            className="mt-4"
            required
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
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
            {isLoading ? "Loading..." : `${results.length} results`}
          </h2>
          {mayCreate && (
            <Button onClick={openEmptyForm}>
              <Plus size={14} />
              Add result
            </Button>
          )}
        </div>

        <Table columns={["ID", "Submission", "Score", "Feedback", "Action"]}>
          {results.map((result) => (
            <tr
              key={result.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-3 py-2 text-slate-700">{result.id}</td>
              <td className="px-3 py-2 text-slate-700">
                {describeSubmission(result.submission)}
              </td>
              <td className="px-3 py-2 text-slate-700">{result.score}</td>
              <td className="px-3 py-2 text-slate-700">
                {shorten(result.feedback)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  {mayEdit ? (
                    <>
                      <IconButton
                        onClick={() => openFormForEditing(result)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton
                        variant="danger"
                        onClick={() => askToDelete(result)}
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
        open={resultToDelete !== null}
        title="Delete result"
        message={
          resultToDelete
            ? `Delete the result for ${describeSubmission(resultToDelete.submission)}? The submission can then be graded again. This cannot be undone.`
            : ""
        }
        isWorking={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setResultToDelete(null)}
      />
    </div>
  );
}
