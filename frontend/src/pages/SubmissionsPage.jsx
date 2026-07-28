// ---------------------------------------------------------------------------
// Submissions: the work students hand in for an assignment.
//
// Same six steps as StudentsPage:
//   1. state for the rows, the form, and the errors
//   2. load() reads the list from the API
//   3. useEffect() calls load() once when the page opens
//   4. handleSubmit() creates a new row, or updates the row being edited
//   5. handleDelete() asks for confirmation, then deletes
//   6. the JSX: error banner, form, table
//
// The new idea on this page is FOREIGN KEYS. A submission points at an
// assignment and at a student, and the backend sends those as bare numbers:
//   { "id": 1, "assignment": 4, "student": 2, "content": "..." }
// There is no nested object with the title or the name in it. So we also load
// the assignment list and the student list, use them to fill two dropdowns,
// and use them again to turn those numbers back into words in the table.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { assignments, students, submissions } from '../api'
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Spinner,
  Table,
  Textarea,
} from '../components/ui'

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
//
// submitted_at is NOT here on purpose: the database fills it in by itself
// (auto_now_add), so we must never send it.
const EMPTY_FORM = {
  assignment: '',
  student: '',
  content: '',
}

export default function SubmissionsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // The two parent lists. They are only used to fill the dropdowns and to
  // look up names for the table, so they get their own state.
  const [assignmentRows, setAssignmentRows] = useState([])
  const [studentRows, setStudentRows] = useState([])

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null) // null means "creating"
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // ---- 2. read the list ------------------------------------------------
  async function load() {
    setLoading(true)
    setError('')
    try {
      // Three lists, asked for at the same time instead of one after another,
      // so the page appears faster. No pagination on this backend, so each
      // response is a plain array.
      const [submissionData, assignmentData, studentData] = await Promise.all([
        submissions.list(),
        assignments.list(),
        students.list(),
      ])
      setRows(submissionData)
      setAssignmentRows(assignmentData)
      setStudentRows(studentData)
    } catch (err) {
      setError(err.text || 'Could not load submissions')
    } finally {
      setLoading(false)
    }
  }

  // ---- 3. run load() once when the page opens --------------------------
  useEffect(() => {
    load()
  }, [])

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function startCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFieldErrors({})
    setShowForm(true)
  }

  function startEdit(row) {
    setForm({
      // A <select> compares its value as a string, so the id has to become a
      // string here or the dropdown would open on "Select..." instead of on
      // the row we are editing.
      assignment: row.assignment ? String(row.assignment) : '',
      student: row.student ? String(row.student) : '',
      content: row.content ?? '',
    })
    setEditingId(row.id)
    setFieldErrors({})
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setFieldErrors({})
  }

  // ---- 4. create or update ---------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setSaving(true)

    // A <select> always hands us a string ("4"), but Django wants the number 4.
    // The empty string means "nothing chosen", so send null and let the
    // backend answer with its own "this field is required" message.
    const payload = {
      assignment: form.assignment === '' ? null : Number(form.assignment),
      student: form.student === '' ? null : Number(form.student),
      content: form.content,
    }

    try {
      if (editingId) {
        await submissions.update(editingId, payload)
      } else {
        await submissions.create(payload)
      }
      cancelForm()
      await load() // refresh the table so it shows the change
    } catch (err) {
      setError(err.text || 'Could not save')
      setFieldErrors(err.fieldErrors || {})
    } finally {
      setSaving(false)
    }
  }

  // ---- 5. delete --------------------------------------------------------
  async function handleDelete(row) {
    if (!window.confirm('Delete this submission?')) return
    setError('')
    try {
      await submissions.remove(row.id)
      await load()
    } catch (err) {
      setError(err.text || 'Could not delete')
    }
  }

  // ---- 6. the screen ----------------------------------------------------

  // The API only gives us a number for each foreign key, so we find the
  // matching parent row ourselves. If it is missing (deleted, or still
  // loading) we fall back to showing the raw id.
  const assignmentTitle = (id) =>
    assignmentRows.find((a) => a.id === id)?.title ?? `#${id}`

  const studentName = (id) =>
    studentRows.find((s) => s.id === id)?.name ?? `Student #${id}`

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'assignment',
      label: 'Assignment',
      render: (row) => assignmentTitle(row.assignment),
    },
    {
      key: 'student',
      label: 'Student',
      render: (row) => studentName(row.student),
    },
    {
      key: 'content',
      label: 'Content',
      // Submitted work can be long, so show only the beginning of it.
      render: (row) => {
        const text = row.content ?? ''
        return text.length > 60 ? `${text.slice(0, 60)}...` : text || '—'
      },
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      // The server sets this timestamp when the row is created, so it is
      // read-only here. It arrives as an ISO string; toLocaleString() turns it
      // into something a person can read.
      render: (row) =>
        row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" onClick={() => startEdit(row)} title="Edit">
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDelete(row)}
            title="Delete"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Submissions" subtitle="Work handed in by students." />

      <Alert kind="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit submission #${editingId}` : 'New submission'}
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* The dropdown shows the assignment title, but the value it
                    stores is the id, because that is what Django wants. */}
                <Field label="Assignment (required)" error={fieldErrors.assignment}>
                  <Select
                    value={form.assignment}
                    onChange={(e) => update('assignment', e.target.value)}
                    options={assignmentRows.map((a) => ({
                      value: a.id,
                      label: a.title,
                    }))}
                    placeholder="Select an assignment..."
                    required
                  />
                </Field>

                <Field label="Student (required)" error={fieldErrors.student}>
                  <Select
                    value={form.student}
                    onChange={(e) => update('student', e.target.value)}
                    options={studentRows.map((s) => ({
                      value: s.id,
                      label: s.name || `Student #${s.id}`,
                    }))}
                    placeholder="Select a student..."
                    required
                  />
                </Field>
              </div>

              <Field label="Content (required)" error={fieldErrors.content}>
                <Textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  required
                />
              </Field>

              {/* There is no field for "Submitted": the database stamps that
                  time itself when the row is created. */}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save changes'
                      : 'Create submission'}
                </Button>
                <Button type="button" variant="secondary" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card
        title={`${rows.length} submission${rows.length === 1 ? '' : 's'}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add submission
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No submissions yet." />
        )}
      </Card>
    </div>
  )
}
