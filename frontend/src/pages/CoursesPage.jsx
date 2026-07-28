// ---------------------------------------------------------------------------
// Courses. Same six steps as StudentsPage:
//   1. state for the rows, the form, and the errors
//   2. load() reads the list from the API
//   3. useEffect() calls load() once when the page opens
//   4. handleSubmit() creates a new row, or updates the row being edited
//   5. handleDelete() asks for confirmation, then deletes
//   6. the JSX: error banner, form, table
//
// The one new idea here is the FOREIGN KEY. A course belongs to a teacher, and
// the backend sends that as a bare number: { "teacher": 3 }. It never sends the
// teacher's name. So this page also loads the teacher list, uses it to fill a
// dropdown, and uses it again to turn that 3 back into a name in the table.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { courses, teachers } from '../api'
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
// teacher starts as '' because that is what an unchosen <select> holds.
const EMPTY_FORM = {
  title: '',
  description: '',
  teacher: '',
}

export default function CoursesPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([])
  // The teacher list lives in its own array. It is not the table data, it is
  // the lookup table for the dropdown and for the Teacher column.
  const [teacherRows, setTeacherRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null) // null means "creating"
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // ---- 2. read the lists ------------------------------------------------
  async function load() {
    setLoading(true)
    setError('')
    try {
      // Two requests, but Promise.all sends them at the same time instead of
      // one after the other. No pagination on this backend, so each response
      // is a plain array.
      const [courseData, teacherData] = await Promise.all([
        courses.list(),
        teachers.list(),
      ])
      setRows(courseData)
      setTeacherRows(teacherData)
    } catch (err) {
      setError(err.text || 'Could not load courses')
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
      // row.teacher is a number. A <select> compares values as strings, so
      // turn it into one or the dropdown will look empty.
      teacher: row.teacher != null ? String(row.teacher) : '',
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

    // Build the payload by hand, because the teacher has to go back to Django
    // as a number. If nothing was chosen we send null and let the backend
    // answer with its own "this field is required" message.
    const payload = {
      title: form.title,
      description: form.description,
      teacher: form.teacher === '' ? null : Number(form.teacher),
    }

    try {
      if (editingId) {
        await courses.update(editingId, payload)
      } else {
        await courses.create(payload)
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
    if (!window.confirm(`Delete course "${row.title}"?`)) return
    setError('')
    try {
      await courses.remove(row.id)
      await load()
    } catch (err) {
      setError(err.text || 'Could not delete')
    }
  }

  // ---- 6. the screen ----------------------------------------------------

  // The dropdown wants { value, label } pairs. name can be null on the Teacher
  // model, so fall back to something readable instead of showing "null".
  const teacherOptions = teacherRows.map((t) => ({
    value: t.id,
    label: t.name || `Teacher #${t.id}`,
  }))

  // The API only gives us the id, so we look the name up here on the client.
  // If the teacher was deleted the id will not be found, and "#3" is a more
  // honest thing to show than a blank cell.
  const teacherName = (id) => {
    const found = teacherRows.find((t) => t.id === id)
    if (!found) return `#${id}`
    return found.name || `Teacher #${found.id}`
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'description',
      label: 'Description',
      // Descriptions can be long. Cut them off so one row cannot stretch the
      // whole table sideways. The full text is in the tooltip.
      render: (row) => (
        <span className="block max-w-xs truncate" title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (row) => teacherName(row.teacher),
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
      <PageHeader title="Courses" subtitle="Every course, and who teaches it." />

      <Alert kind="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit course #${editingId}` : 'New course'}
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" error={fieldErrors.title}>
                  <Input
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    required
                  />
                </Field>

                {/* The value of every <option> is a teacher id. */}
                <Field label="Teacher" error={fieldErrors.teacher}>
                  <Select
                    options={teacherOptions}
                    placeholder="Choose a teacher..."
                    value={form.teacher}
                    onChange={(e) => update('teacher', e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="Description" error={fieldErrors.description}>
                <Textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create course'}
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
        title={`${rows.length} course${rows.length === 1 ? '' : 's'}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add course
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No courses yet." />
        )}
      </Card>
    </div>
  )
}
