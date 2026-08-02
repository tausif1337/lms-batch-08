// ---------------------------------------------------------------------------
// THE ENROLLMENTS PAGE.
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
import { courses, enrollments, students } from "../data.js";

// An enrollment row does not hold the student's name. It holds the student's
// id number, like student: 1. So to print a name on screen we have to go to
// the students list and find the student whose id matches that number.
function findStudentName(studentId) {
  const student = students.find((item) => item.id === studentId);
  if (student) {
    return student.name;
  }
  return "Unknown";
}

// The course works the same way. The row holds a course id, so we look the
// course up in the courses list and take its title.
function findCourseTitle(courseId) {
  const course = courses.find((item) => item.id === courseId);
  if (course) {
    return course.title;
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

export default function Enrollments() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   studentId     -> what is in the box right now
  //   setStudentId  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which enrollment are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add enrollment" button calls this. It empties every box first.
  function openEmptyForm() {
    setStudentId("");
    setCourseId("");
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the enrollment from that row.
  // We copy that enrollment's details into the boxes.
  function openFormForEditing(enrollment) {
    setStudentId(enrollment.student);
    setCourseId(enrollment.course);
    setEditingId(enrollment.id);
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
      <h1 className="text-2xl font-semibold text-slate-900">Enrollments</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Which student is taking which course.
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
              {editingId === 0 ? "New enrollment" : "Edit enrollment"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* There is no box for the enrolled date. The table below shows the
              date each row already has, but it is not something you type in
              here. */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* A dropdown is a <select> with one <option> inside it for every
                student. The first option is empty, so the box starts blank. */}
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
          </div>

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

      {/* ---- the table of enrollments ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {enrollments.length} enrollments
          </h2>
          <button onClick={openEmptyForm} className={blueButton}>
            <Plus size={14} />
            Add enrollment
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Course</th>
                <th className="px-3 py-2 font-medium">Enrolled</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every enrollment in the list".
                  React needs the key so it can tell the rows apart. */}
              {enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{enrollment.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {findStudentName(enrollment.student)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {findCourseTitle(enrollment.course)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {enrollment.enrollment_date}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openFormForEditing(enrollment)}
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
