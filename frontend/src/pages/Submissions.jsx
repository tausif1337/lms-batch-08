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

function findAssignmentTitle(assignmentId) {
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (assignment) {
    return assignment.title;
  }
  return "Unknown";
}

function findStudentName(studentId) {
  const student = students.find((item) => item.id === studentId);
  if (student) {
    return student.name;
  }
  return "Unknown";
}

function showDateAndTime(text) {
  return new Date(text).toLocaleString();
}

function shorten(text) {
  if (text.length > 60) {
    return text.slice(0, 60) + "...";
  }
  return text;
}

export default function Submissions() {
  const [assignmentId, setAssignmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [content, setContent] = useState("");

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(0);

  function openEmptyForm() {
    setAssignmentId("");
    setStudentId("");
    setContent("");
    setEditingId(0);
    setFormIsOpen(true);
  }

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

  function handleSave(event) {
    event.preventDefault();
    closeForm();
  }

  return (
    <div>
      <PageHeader title="Submissions" subtitle="Work handed in by students." />

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
