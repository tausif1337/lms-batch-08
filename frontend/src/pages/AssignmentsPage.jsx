// ---------------------------------------------------------------------------
// Assignments. Same six steps as StudentsPage:
//   1. state for the rows, the form, and the errors
//   2. load() reads the list from the API
//   3. useEffect() calls load() once when the page opens
//   4. handleSubmit() creates a new row, or updates the row being edited
//   5. handleDelete() asks for confirmation, then deletes
//   6. the JSX: error banner, form, table
//
// Two extras compared to StudentsPage:
//
//   * An assignment points at a course AND at a lesson, and the API sends
//     those as bare numbers ("course": 2), never as objects. So load() also
//     fetches the course list and the lesson list: once to fill the two
//     dropdowns, and once more to turn those numbers back into titles in the
//     table.
//
//   * HEADS UP: the backend does NOT check that the chosen lesson actually
//     belongs to the chosen course (models.py:62-63 declares the two foreign
//     keys independently). Nothing stops you saving "Lesson 1 of Biology"
//     against the Maths course. If that matters, the check has to be added
//     on the server; the dropdowns below cannot enforce it.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { assignments, courses, lessons } from '../api'
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Table,
  Textarea,
} from '../components/ui'

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
// course and lesson start as '' because that is what an unchosen <select>
// gives us.
const EMPTY_FORM = {
  title: '',
  description: '',
  course: '',
  lesson: '',
  due_date: '',
}

// --- due_date and time zones ------------------------------------------------
// The API stores UTC and sends it back with a Z on the end, like
// "2026-08-15T23:59:00Z". But <input type="datetime-local"> has no time zone
// at all — whatever you put in it is shown as LOCAL time.
//
// So the string cannot simply be cut down to 16 characters. In a UTC+6 country
// that would show "Aug 15, 11:59 PM" for a deadline that is really "Aug 16,
// 5:59 AM" locally, and the table (which converts properly) would disagree
// with the form by six hours.
//
// These two helpers convert in both directions.

// API (UTC) -> what the input should display (local)
function isoToInput(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  // Subtract the time zone offset so that calling .toISOString() below yields
  // the LOCAL clock reading rather than the UTC one.
  const localMs = d.getTime() - d.getTimezoneOffset() * 60 * 1000
  return new Date(localMs).toISOString().slice(0, 16)
}

// What the user typed (local) -> what the API should store (UTC)
function inputToIso(inputValue) {
  if (!inputValue) return null
  const d = new Date(inputValue) // a value with no Z is read as local time
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export default function AssignmentsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([])
  const [courseRows, setCourseRows] = useState([]) // for the dropdown + lookups
  const [lessonRows, setLessonRows] = useState([]) // same, for lessons
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null) // null means "creating"
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // ---- 2. read the lists -----------------------------------------------
  async function load() {
    setLoading(true)
    setError('')
    try {
      // Three requests, sent at the same time instead of one after another,
      // so the page appears faster. Promise.all hands back the answers in
      // the same order we asked for them.
      // No pagination on this backend, so each response is a plain array.
      const [assignmentData, courseData, lessonData] = await Promise.all([
        assignments.list(),
        courses.list(),
        lessons.list(),
      ])
      setRows(assignmentData)
      setCourseRows(courseData)
      setLessonRows(lessonData)
    } catch (err) {
      setError(err.text || 'Could not load assignments')
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
      title: row.title ?? '',
      description: row.description ?? '',
      // The ids are numbers, but a <select> value has to be a string,
      // otherwise the dropdown shows the placeholder instead of the row.
      course: row.course ? String(row.course) : '',
      lesson: row.lesson ? String(row.lesson) : '',
      due_date: isoToInput(row.due_date),
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
    try {
      // Build the payload by hand, because the two dropdowns hold strings
      // and Django wants numbers. Number('') is 0, which would look like a
      // real id, so send null when nothing was chosen and let the backend
      // reply with its own "this field is required" message.
      const payload = {
        title: form.title,
        description: form.description,
        course: form.course === '' ? null : Number(form.course),
        lesson: form.lesson === '' ? null : Number(form.lesson),
        due_date: inputToIso(form.due_date),
      }

      if (editingId) {
        await assignments.update(editingId, payload)
      } else {
        await assignments.create(payload)
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
    if (!window.confirm(`Delete assignment "${row.title}"?`)) return
    setError('')
    try {
      await assignments.remove(row.id)
      await load()
    } catch (err) {
      setError(err.text || 'Could not delete')
    }
  }

  // ---- 6. the screen ----------------------------------------------------

  // The API only gives us a number for course and lesson, so look the title
  // up in the lists we loaded. If the row is missing (deleted, or not loaded
  // yet) fall back to showing the raw id so the cell is never blank.
  const courseTitle = (id) => courseRows.find((c) => c.id === id)?.title ?? `#${id}`
  const lessonTitle = (id) => lessonRows.find((l) => l.id === id)?.title ?? `#${id}`

  // Turn "2026-08-01T14:30:00Z" into something a person can read.
  // new Date(null) would print 1 January 1970, so check for a value first.
  const dueDate = (value) => (value ? new Date(value).toLocaleString() : '—')

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'course',
      label: 'Course',
      render: (row) => courseTitle(row.course),
    },
    {
      key: 'lesson',
      label: 'Lesson',
      render: (row) => lessonTitle(row.lesson),
    },
    {
      key: 'due_date',
      label: 'Due',
      render: (row) => dueDate(row.due_date),
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
      <PageHeader title="Assignments" subtitle="Work set against a lesson." />

      <Alert kind="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit assignment #${editingId}` : 'New assignment'}
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title (required)" error={fieldErrors.title}>
                  <Input
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    required
                  />
                </Field>

                {/* Django wants "YYYY-MM-DDTHH:MM" here, which is exactly
                    what <input type="datetime-local"> produces. */}
                <Field label="Due date (required)" error={fieldErrors.due_date}>
                  <Input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => update('due_date', e.target.value)}
                    required
                  />
                </Field>

                {/* The value of a <select> is always a string, so we keep
                    the id as a string in the form and convert it with
                    Number() in handleSubmit. */}
                <Field label="Course (required)" error={fieldErrors.course}>
                  <Select
                    value={form.course}
                    onChange={(e) => update('course', e.target.value)}
                    options={courseRows.map((c) => ({
                      value: c.id,
                      label: c.title,
                    }))}
                    placeholder="Select a course..."
                    required
                  />
                </Field>

                {/* This list is every lesson in the system, not just the
                    ones in the course above. The backend does not link the
                    two, so a mismatched pair will save without complaint. */}
                <Field label="Lesson (required)" error={fieldErrors.lesson}>
                  <Select
                    value={form.lesson}
                    onChange={(e) => update('lesson', e.target.value)}
                    options={lessonRows.map((l) => ({
                      value: l.id,
                      label: l.title,
                    }))}
                    placeholder="Select a lesson..."
                    required
                  />
                </Field>
              </div>

              <Field label="Description (required)" error={fieldErrors.description}>
                <Textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save changes'
                      : 'Create assignment'}
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
        title={`${rows.length} assignment${rows.length === 1 ? '' : 's'}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add assignment
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No assignments yet." />
        )}
      </Card>
    </div>
  )
}
