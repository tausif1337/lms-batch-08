// ---------------------------------------------------------------------------
// Same six steps as StudentsPage:
//   1. state for the rows, the form, and the errors
//   2. load() reads the list from the API
//   3. useEffect() calls load() once when the page opens
//   4. handleSubmit() creates a new row, or updates the row being edited
//   5. handleDelete() asks for confirmation, then deletes
//   6. the JSX: error banner, form, table
//
// Two extra things happen on this page:
//   - `submission` is a foreign key, and the API sends it as a bare number
//     ("submission": 7), so we also load the submission list to fill the
//     dropdown and to print something readable in the table.
//   - a submission can only be graded ONCE (see handleSubmit).
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { results, submissions } from "../api";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Table,
  Textarea,
} from "../components/ui";

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
// Everything starts as a string because that is what an <input> and a
// <select> give us. We convert to numbers right before sending.
const EMPTY_FORM = {
  submission: "",
  score: "",
  feedback: "",
};

export default function ResultsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // The parent list for the `submission` dropdown. It lives in its own
  // state array because it is a different resource from `rows`.
  const [submissionRows, setSubmissionRows] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null means "creating"
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- 2. read the list ------------------------------------------------
  async function load() {
    setLoading(true);
    setError("");
    try {
      // Two requests, but Promise.all fires them at the same time instead of
      // one after the other, so the page appears faster.
      // No pagination on this backend, so each response is a plain array.
      const [resultData, submissionData] = await Promise.all([
        results.list(),
        submissions.list(),
      ]);
      setRows(resultData);
      setSubmissionRows(submissionData);
    } catch (err) {
      setError(err.text || "Could not load results");
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
    setForm({
      // A <select> compares its value as a string, so turn the number the
      // API gave us back into text. Same for the number input.
      submission: row.submission ? String(row.submission) : "",
      score:
        row.score === null || row.score === undefined ? "" : String(row.score),
      feedback: row.feedback ?? "",
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
      // Django wants numbers here, but the form holds strings. Convert now,
      // in one place, so the rest of the page can stay simple.
      //
      // Watch the empty case: Number('') is 0, not NaN. Sending it would post
      // submission 0 (a real-looking id that does not exist) and score 0 (a
      // real-looking mark that would be saved without complaint). So when
      // nothing was filled in we send null and let Django answer with its own
      // "this field is required" message.
      const payload = {
        submission: form.submission === "" ? null : Number(form.submission),
        score: form.score === "" ? null : Number(form.score),
        feedback: form.feedback,
      };

      if (editingId) {
        await results.update(editingId, payload);
      } else {
        await results.create(payload);
      }
      cancelForm();
      await load(); // refresh the table so it shows the change
    } catch (err) {
      // Results.submission is a OneToOneField, so a submission can be graded
      // only once. Grading the same one twice returns a 400 whose wording
      // ("results with this submission already exists") does not explain what
      // to do about it. We spot that case and say it plainly instead.
      //
      // One catch: an ordinary "you forgot to pick a submission" error names
      // the same field, so matching on the word alone would tell the user the
      // work was already graded when it was not. Rule those messages out
      // first.
      const raw = (err.text || "").toLowerCase();
      const looksLikeMissingValue =
        raw.includes("required") ||
        raw.includes("may not be null") ||
        raw.includes("does not exist") ||
        raw.includes("valid number");
      const isDuplicate =
        err.status === 400 &&
        !looksLikeMissingValue &&
        (raw.includes("submission") ||
          raw.includes("unique") ||
          raw.includes("already exists"));

      if (isDuplicate) {
        setError(
          "This submission has already been graded. Edit the existing result instead.",
        );
      } else {
        setError(err.text || "Could not save");
      }
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  }

  // ---- 5. delete --------------------------------------------------------
  async function handleDelete(row) {
    if (!window.confirm("Delete this result?")) return;
    setError("");
    try {
      await results.remove(row.id);
      await load();
    } catch (err) {
      setError(err.text || "Could not delete");
    }
  }

  // ---- 6. the screen ----------------------------------------------------
  // Feedback can be long, so the table shows only the beginning of it.
  const shortFeedback = (text) => {
    if (!text) return "—";
    return text.length > 60 ? `${text.slice(0, 60)}...` : text;
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "submission",
      label: "Submission",
      render: (row) => `#${row.submission}`,
    },
    { key: "score", label: "Score" },
    {
      key: "feedback",
      label: "Feedback",
      render: (row) => shortFeedback(row.feedback),
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
        title="Results"
        subtitle="Scores and feedback for submitted work."
      />

      <Alert kind="error" onClose={() => setError("")}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit result #${editingId}` : "New result"}
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* The dropdown is built from the submission list we loaded
                    above. Its value is the submission's id number. */}
                <Field
                  label="Submission (required)"
                  error={fieldErrors.submission}
                >
                  <Select
                    value={form.submission}
                    onChange={(e) => update("submission", e.target.value)}
                    options={submissionRows.map((s) => ({
                      value: s.id,
                      label: `Submission #${s.id}`,
                    }))}
                    placeholder="Select a submission..."
                    required
                  />
                </Field>

                {/* step="0.01" because score is a FloatField, so decimals
                    like 87.5 must be allowed. */}
                <Field label="Score (required)" error={fieldErrors.score}>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.score}
                    onChange={(e) => update("score", e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="Feedback (required)" error={fieldErrors.feedback}>
                <Textarea
                  value={form.feedback}
                  onChange={(e) => update("feedback", e.target.value)}
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create result"}
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
        title={`${rows.length} result${rows.length === 1 ? "" : "s"}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add result
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No results yet." />
        )}
      </Card>
    </div>
  );
}
