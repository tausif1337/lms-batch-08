import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { results, submissions } from "../data.js";
import {
  Button,
  IconButton,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "../components/index.js";

function shorten(text) {
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Results() {
  const [submissionId, setSubmissionId] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setSubmissionId("");
    setScore("");
    setFeedback("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  function openFormForEditing(result) {
    setSubmissionId(result.submission);
    setScore(result.score);
    setFeedback(result.feedback);
    setEditingId(result.id);
    setFormIsOpen(true);
  }

  function closeForm() {
    setFormIsOpen(false);
  }

  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Scores and feedback for submitted work."
      />

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
              value={submissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
            >
              {submissions.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {"Submission #" + submission.id}
                </option>
              ))}
            </Select>

            <Input
              label="Score"
              type="number"
              step="0.01"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>

          <Textarea
            label="Feedback"
            className="mt-4"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />

          <div className="mt-4 flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {results.length} results
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add result
          </Button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Submission</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Feedback</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{result.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {"Submission #" + result.submission}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{result.score}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {shorten(result.feedback)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <IconButton onClick={() => openFormForEditing(result)}>
                        <Pencil size={14} />
                      </IconButton>

                      <IconButton variant="danger">
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
