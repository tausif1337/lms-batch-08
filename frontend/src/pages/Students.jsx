// ---------------------------------------------------------------------------
// THE STUDENTS PAGE.
//
// This page is built exactly like the Teachers page. If anything here looks
// unfamiliar, open src/pages/Teachers.jsx and read that file first.
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
import { students } from "../data.js";
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  PageHeader,
} from "../components/index.js";

export default function Students() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   name     -> what is in the box right now
  //   setName  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Is the form on the screen? true means yes.
  const [formIsOpen, setFormIsOpen] = useState(false);

  // Which student are we editing? 0 means "none, we are adding a new one".
  const [editingId, setEditingId] = useState(0);

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // The "Add student" button calls this. It empties every box first.
  function openEmptyForm() {
    setName("");
    setEmail("");
    setRollNumber("");
    setEnrollmentDate("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

  // The pencil button calls this, and hands us the student from that row.
  // We copy that student's details into the boxes.
  function openFormForEditing(student) {
    setName(student.name);
    setEmail(student.email);
    setRollNumber(student.roll_number);
    setEnrollmentDate(student.enrollment_date);
    setIsActive(student.is_active);
    setEditingId(student.id);
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
      <PageHeader title="Students" subtitle="Everyone enrolled in the school." />

      {/* ---- the form ----
          The && below means: only show this form when formIsOpen is true. */}
      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New student" : "Edit student"}
            </h2>
            <IconButton onClick={closeForm}>
              <X size={16} />
            </IconButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label="Roll number"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />

            {/* type="date" shows a little calendar picker, but the value it
                gives back is text shaped like 2026-01-12. */}
            <Input
              label="Enrollment date"
              type="date"
              value={enrollmentDate}
              onChange={(event) => setEnrollmentDate(event.target.value)}
            />
          </div>

          {/* A tickbox uses `checked` instead of `value`, and reads
              event.target.checked instead of event.target.value. */}
          <Checkbox
            label="Active"
            className="mt-4"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />

          <div className="mt-4 flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ---- the table of students ---- */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            {students.length} students
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add student
          </Button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Roll no.</th>
                <th className="px-3 py-2 font-medium">Enrolled</th>
                <th className="px-3 py-2 font-medium">Active</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {/* .map() means "do this once for every student in the list".
                  React needs the key so it can tell the rows apart. */}
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-slate-700">{student.id}</td>
                  <td className="px-3 py-2 text-slate-700">{student.name}</td>
                  <td className="px-3 py-2 text-slate-700">{student.email}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {student.roll_number}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {student.enrollment_date}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {student.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <IconButton onClick={() => openFormForEditing(student)}>
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
