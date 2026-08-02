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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setName("");
    setEmail("");
    setRollNumber("");
    setEnrollmentDate("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

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

  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  return (
    <div>
      <PageHeader title="Students" subtitle="Everyone enrolled in the school." />

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

            <Input
              label="Enrollment date"
              type="date"
              value={enrollmentDate}
              onChange={(event) => setEnrollmentDate(event.target.value)}
            />
          </div>

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
