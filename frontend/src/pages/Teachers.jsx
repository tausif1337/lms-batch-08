import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { teachers } from "../data.js";
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  PageHeader,
} from "../components/index.js";


export default function Teachers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setName("");
    setEmail("");
    setSubject("");
    setIsActive(true);
    setEditingId(0);
    setFormIsOpen(true);
  }

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

  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  return (
    <div>
      <PageHeader title="Teachers" subtitle="The people who teach courses." />

      {formIsOpen && (
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId === 0 ? "New teacher" : "Edit teacher"}
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
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
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
            {teachers.length} teachers
          </h2>
          <Button onClick={openEmptyForm}>
            <Plus size={14} />
            Add teacher
          </Button>
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
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
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
                      <IconButton onClick={() => openFormForEditing(teacher)}>
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
