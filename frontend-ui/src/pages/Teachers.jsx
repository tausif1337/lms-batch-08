// ---------------------------------------------------------------------------
// THE TEACHERS PAGE — READ THIS FILE FIRST.
//
// Students, Courses, Enrollments, Lessons, Assignments, Submissions and
// Results are all built exactly the same way. Once you understand this file,
// you understand all of them.
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
import { teachers } from "../data.js";

// These are just long strings of Tailwind classes, pulled out so the HTML
// below stays readable. They are plain text, nothing clever.
const blueButton =
  "inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700";
const greyButton =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
const inputBox =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const labelText = "mb-1 block text-sm font-medium text-slate-700";

export default function Teachers() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   name     -> what is in the box right now
  //   setName  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which teacher are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add teacher" button calls this. It empties every box first.
  function openEmptyForm() {
    setName("");
    setEmail("");
    setSubject("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the teacher from that row.
  // We copy that teacher's details into the boxes.
  function openFormForEditing(teacher) {
    setName(teacher.name);
    setEmail(teacher.email);
    setSubject(teacher.subject);
    setIsActive(teacher.is_active);
    setEditingId(teacher.id);
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
      <h1 className="text-2xl font-semibold text-slate-900">Teachers</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        The people who teach courses.
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
              {editingId === 0 ? "New teacher" : "Edit teacher"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Each box is a <label> wrapped around an <input>, so clicking
                the words puts the cursor in the box. */}
            <label>
              <span className={labelText}>Name</span>
              <input
                className={inputBox}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              <span className={labelText}>Email</span>
              <input
                className={inputBox}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label>
              <span className={labelText}>Subject</span>
              <input
                className={inputBox}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>
          </div>

          {/* A tickbox uses `checked` instead of `value`, and reads
              event.target.checked instead of event.target.value. */}
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active
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

      {/* ---- the table of teachers ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {teachers.length} teachers
          </h2>
          <button onClick={openEmptyForm} className={blueButton}>
            <Plus size={14} />
            Add teacher
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Active</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every teacher in the list".
                  React needs the key so it can tell the rows apart. */}
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{teacher.id}</td>
                  <td className="px-3 py-2 text-slate-700">{teacher.name}</td>
                  <td className="px-3 py-2 text-slate-700">{teacher.email}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {teacher.subject}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {teacher.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openFormForEditing(teacher)}
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
