// ---------------------------------------------------------------------------
// THE COURSES PAGE.
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
import { courses, teachers } from "../data.js";

// A course row does not hold the teacher's name. It holds the teacher's id
// number, like teacher: 1. So to print a name on screen we have to go to the
// teachers list and find the teacher whose id matches that number.
function findTeacherName(teacherId) {
  const teacher = teachers.find((item) => item.id === teacherId);
  if (teacher) {
    return teacher.name;
  }
  return "Unknown";
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

export default function Courses() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   title     -> what is in the box right now
  //   setTitle  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [title, setTitle] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [description, setDescription] = useState("");

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which course are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add course" button calls this. It empties every box first.
  function openEmptyForm() {
    setTitle("");
    setTeacherId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the course from that row.
  // We copy that course's details into the boxes.
  function openFormForEditing(course) {
    setTitle(course.title);
    setTeacherId(course.teacher);
    setDescription(course.description);
    setEditingId(course.id);
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
      <h1 className="text-2xl font-semibold text-slate-900">Courses</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Every course, and who teaches it.
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
              {editingId === 0 ? "New course" : "Edit course"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Each box is a <label> wrapped around an <input>, so clicking
                the words puts the cursor in the box. */}
            <label>
              <span className={labelText}>Title</span>
              <input
                className={inputBox}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            {/* A dropdown is a <select> with one <option> inside it for every
                teacher. The first option is empty, so the box starts blank. */}
            <label>
              <span className={labelText}>Teacher</span>
              <select
                className={inputBox}
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
              >
                <option value="">Choose a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* A textarea is a taller box for longer text. rows={3} means it is
              three lines tall to begin with. */}
          <label className="mt-4 block">
            <span className={labelText}>Description</span>
            <textarea
              rows={3}
              className={inputBox}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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

      {/* ---- the table of courses ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {courses.length} courses
          </h2>
          <button onClick={openEmptyForm} className={blueButton}>
            <Plus size={14} />
            Add course
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Teacher</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every course in the list".
                  React needs the key so it can tell the rows apart. */}
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{course.id}</td>
                  <td className="px-3 py-2 text-slate-700">{course.title}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {/* truncate cuts long text off with a "..." at the end. */}
                    <span className="block max-w-xs truncate">
                      {course.description}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findTeacherName(course.teacher)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openFormForEditing(course)}
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
