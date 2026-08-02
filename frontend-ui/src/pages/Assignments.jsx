// ---------------------------------------------------------------------------
// THE ASSIGNMENTS PAGE.
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
import { assignments, courses, lessons } from "../data.js";

// An assignment row does not hold the course title. It holds the course's id
// number, like course: 1. So to print a title on screen we have to go to the
// courses list and find the course whose id matches that number.
function findCourseTitle(courseId) {
  const course = courses.find((item) => item.id === courseId);
  if (course) {
    return course.title;
  }
  return "Unknown";
}

// The lesson works the same way. The row holds a lesson id, so we look that
// id up in the lessons list to get the title.
function findLessonTitle(lessonId) {
  const lesson = lessons.find((item) => item.id === lessonId);
  if (lesson) {
    return lesson.title;
  }
  return "Unknown";
}

// This turns 2026-08-15T23:59:00 into something readable in the reader's own
// country format.
function showDateAndTime(text) {
  return new Date(text).toLocaleString();
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

export default function Assignments() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   title     -> what is in the box right now
  //   setTitle  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which assignment are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add assignment" button calls this. It empties every box first.
  function openEmptyForm() {
    setTitle("");
    setDueDate("");
    setCourseId("");
    setLessonId("");
    setDescription("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the assignment from that row.
  // We copy that assignment's details into the boxes.
  function openFormForEditing(assignment) {
    setTitle(assignment.title);

    // The stored date looks like "2026-08-15T23:59:00", but a datetime-local
    // box only accepts the first 16 characters, "2026-08-15T23:59", so we cut
    // the seconds off the end before putting it in the box.
    setDueDate(assignment.due_date.slice(0, 16));

    setCourseId(assignment.course);
    setLessonId(assignment.lesson);
    setDescription(assignment.description);
    setEditingId(assignment.id);
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
      <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Work set against a lesson.
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
              {editingId === 0 ? "New assignment" : "Edit assignment"}
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

            {/* type="datetime-local" gives the browser's own date and time
                picker, so the reader does not have to type the date by hand. */}
            <label>
              <span className={labelText}>Due date</span>
              <input
                className={inputBox}
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>

            {/* A dropdown is a <select> with one <option> inside it for every
                course. The first option is empty, so the box starts blank. */}
            <label>
              <span className={labelText}>Course</span>
              <select
                className={inputBox}
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelText}>Lesson</span>
              <select
                className={inputBox}
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
              >
                <option value="">Choose a lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
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

      {/* ---- the table of assignments ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {assignments.length} assignments
          </h2>
          <button onClick={openEmptyForm} className={blueButton}>
            <Plus size={14} />
            Add assignment
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Course</th>
                <th className="px-3 py-2 font-medium">Lesson</th>
                <th className="px-3 py-2 font-medium">Due</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every assignment in the list".
                  React needs the key so it can tell the rows apart. */}
              {assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{assignment.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {assignment.title}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findCourseTitle(assignment.course)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findLessonTitle(assignment.lesson)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {showDateAndTime(assignment.due_date)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openFormForEditing(assignment)}
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
