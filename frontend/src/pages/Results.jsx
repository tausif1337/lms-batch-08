// ---------------------------------------------------------------------------
// THE RESULTS PAGE.
//
// This page is built the same way as Teachers.jsx. If anything here looks
// new, open that file first, because it explains each idea from the start.
//
// The page has three parts, in this order:
//   1. Remember things  — useState, for the form boxes
//   2. Do things        — small functions the buttons call
//   3. Show things      — the HTML that ends up on the screen
//
// The buttons and the boxes come from src/components, so every page uses the
// same ones.
//
// One important thing: nothing you type is ever saved. This project has no
// server and no database. Clicking "Save" only closes the form. The list you
// see comes from src/data.js and never changes.
// ---------------------------------------------------------------------------

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

// Feedback can be long, so the table shows only the start of it. This takes
// the first 60 characters and puts three dots on the end. Shorter feedback is
// handed back unchanged.
function shorten(text) {
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Results() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   score     -> what is in the box right now
  //   setScore  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [submissionId, setSubmissionId] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which result are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add result" button calls this. It empties every box first.
  function openEmptyForm() {
    setSubmissionId("");
    setScore("");
    setFeedback("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the result from that row.
  // We copy that result's details into the boxes.
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

  // This runs when the form is submitted.
  // event.preventDefault() stops the browser reloading the whole page, which
  // is what an HTML form normally does when you press its button.
  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  // =========================================================================
  // 3. SHOW THINGS
  // =========================================================================
  return (
    <div>
      {/* ---- the title at the top of the page ---- */}
      <PageHeader
        title="Results"
        subtitle="Scores and feedback for submitted work."
      />

      {/* ---- the form ----
          The && below means: only show this form when formIsOpen is true. */}
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
            {/* A <Select> is a dropdown. The <option> lines inside it are
                written here, one for every submission. `placeholder` is the
                empty first line, so the box starts blank. */}
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

            {/* step="0.01" lets you type half marks like 87.5. */}
            <Input
              label="Score"
              type="number"
              step="0.01"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>

          {/* A <Textarea> is a taller box for longer text. It is three lines
              tall unless you ask for more with rows={5}. */}
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

      {/* ---- the table of results ---- */}
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
              {/* .map() means "do this once for every result in the list".
                  React needs the key so it can tell the rows apart. */}
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

                      {/* This button does nothing. There is nothing to delete
                          from, because the list is a fixed list in data.js. */}
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
