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
// The buttons and the boxes come from src/components, so every page uses the
// same ones.
//
// One important thing: nothing you type is ever saved. This project has no
// server and no database. Clicking "Save" only closes the form. The list you
// see comes from src/data.js and never changes.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { assignments, students, submissions } from "../data.js";
import {
  Button,
  IconButton,
  PageHeader,
  Select,
  Textarea,
} from "../components/index.js";

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
      <PageHeader title="Submissions" subtitle="Work handed in by students." />

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
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* A <Select> is a dropdown. The <option> lines inside it are
                written here, one for every assignment. `placeholder` is the
                empty first line, so the box starts blank. */}
            <Select
              label="Assignment"
              placeholder="Choose an assignment..."
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

          {/* A <Textarea> is a taller box for longer text. rows={5} makes this
              one five lines tall instead of the usual three. */}
          <Textarea
            label="Content"
            rows={5}
            className="mt-4"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="mt-4 flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ---- the table of submissions ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {submissions.length} submissions
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add submission
          </Button>
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
                      <IconButton onClick={() => openFormForEditing(submission)}>
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
