// Results. Same four steps as StudentsPage — read that file first.
//
// A result points at one submission by id, so the submission list fills the
// dropdown.

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { results, submissions } from "../data";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Table,
  Textarea,
} from "../components/ui";

// Everything starts as a string because that is what an <input> and a
// <select> hand back.
const EMPTY_FORM = {
  submission: "",
  score: "",
  feedback: "",
};

export default function ResultsPage() {
  const rows = results;

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
      // A <select> compares its value as a string, so turn the number into
      // text. Same for the number input.
      submission: String(row.submission),
      score: String(row.score),
      feedback: row.feedback,
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

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit result #${editingId}` : "New result"}
            action={
              <Button variant="ghost" onClick={closeForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Submission">
                  <Select
                    value={form.submission}
                    onChange={(e) => update("submission", e.target.value)}
                    options={submissions.map((s) => ({
                      value: s.id,
                      label: `Submission #${s.id}`,
                    }))}
                    placeholder="Select a submission..."
                  />
                </Field>

                {/* step="0.01" so decimal marks like 87.5 are allowed. */}
                <Field label="Score">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.score}
                    onChange={(e) => update("score", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Feedback">
                <Textarea
                  value={form.feedback}
                  onChange={(e) => update("feedback", e.target.value)}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Save changes" : "Create result"}
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
        <Table columns={columns} rows={rows} empty="No results yet." />
      </Card>
    </div>
  );
}
