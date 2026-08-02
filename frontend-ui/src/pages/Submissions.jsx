// ---------------------------------------------------------------------------
// THE SUBMISSIONS PAGE.
//
// This page is built the same way as Teachers.jsx. If anything here looks
// new, open that file first, because it explains each idea from the start.
//
// The page has three parts, in this order:
//   1. Remember things  — useState, for the form boxes
//   2. Do things        — small functions the buttons call
//   3. Show things      — the HTML that ends up on the screen
//
// One important thing: nothing you type is ever saved. This project has no
// server and no database. Clicking "Save" only closes the form. The list you
// see comes from src/data.js and never changes.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignments, students, submissions } from "../data.js";

// A submission row does not hold the assignment title. It holds the
// assignment's id number, like assignment: 1. So to print a title on screen we
// have to go to the assignments list and find the one whose id matches.
function findAssignmentTitle(assignmentId) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (assignment) {
    return assignment.title;
  }
  return "Unknown";
}

// The student works the same way. The row holds a student id, so we look that
// id up in the students list to get the name.
function findStudentName(studentId) {
  const student = students.find((item) => item.id === studentId);
  if (student) {
    return student.name;
  }
  return "Unknown";
}

// This turns 2026-08-15T23:59:00 into something readable in the reader's own
// country format.
function showDateAndTime(text) {
  return new Date(text).toLocaleString();
}

// Handed-in work can be long, so the table shows only the start of it. This
// cuts anything over 60 characters and puts three dots on the end.
function shorten(text) {
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

// These are just long strings of Tailwind classes, pulled out so the HTML
// below stays readable. They are plain text, nothing clever.
const blueButton =
  "inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700";
const greyButton =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
const inputBox =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const labelText = "mb-1 block text-sm font-medium text-slate-700";

export default function Submissions() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   content     -> what is in the box right now
  //   setContent  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [assignmentId, setAssignmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [content, setContent] = useState("");

  // There is no form box for the submitted time. The clock decides that when
  // the work is handed in, so the reader never types it.

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which submission are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add submission" button calls this. It empties every box first.
  function openEmptyForm() {
    setAssignmentId("");
    setStudentId("");
    setContent("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the submission from that row.
  // We copy that submission's details into the boxes.
  function openFormForEditing(submission) {
    setAssignmentId(submission.assignment);
    setStudentId(submission.student);
    setContent(submission.content);
    setEditingId(submission.id);
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
      <h1 className="text-2xl font-semibold text-slate-900">Submissions</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Work handed in by students.
      </p>

      {/* ---- the form ----
          The && below means: only show this form when formIsOpen is true. */}
      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New submission" : "Edit submission"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* A dropdown is a <select> with one <option> inside it for every
                assignment. The first option is empty, so the box starts
                blank. Clicking the words puts the cursor in the box. */}
            <label>
              <span className={labelText}>Assignment</span>
              <select
                className={inputBox}
                value={assignmentId}
                onChange={(event) => setAssignmentId(event.target.value)}
              >
                <option value="">Choose an assignment...</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelText}>Student</span>
              <select
                className={inputBox}
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* A textarea is a taller box for longer text. rows={5} means it is
              five lines tall to begin with. */}
          <label className="mt-4 block">
            <span className={labelText}>Content</span>
            <textarea
              rows={5}
              className={inputBox}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button type="submit" className={blueButton}>
              Save
            </button>
            <button type="button" onClick={closeForm} className={greyButton}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ---- the table of submissions ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {submissions.length} submissions
          </h2>
          <button onClick={openEmptyForm} className={blueButton}>
            <Plus size={14} />
            Add submission
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Assignment</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Content</th>
                <th className="px-3 py-2 font-medium">Submitted</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every submission in the list".
                  React needs the key so it can tell the rows apart. */}
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
                      <button
                        onClick={() => openFormForEditing(submission)}
                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* This button does nothing. There is nothing to delete
                          from, because the list is a fixed list in data.js. */}
                      <button className="rounded-md p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
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
