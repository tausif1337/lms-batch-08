// ---------------------------------------------------------------------------
// Same six steps as StudentsPage, plus one extra job.
//
// A lesson belongs to a course, and the backend sends that link as a plain
// number: { "course": 4 }. There is no nested course object. So this page has
// to load the course list too — once to fill the dropdown, and once more to
// turn that 4 back into a readable title in the table.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { lessons, courses } from '../api'
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
// course starts as '' because a <select> works with strings, not numbers.
const EMPTY_FORM = {
  title: '',
  description: '',
  course: '',
}

export default function LessonsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([])
  const [courseRows, setCourseRows] = useState([]) // the parent list, for the dropdown
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
      // Two requests, sent at the same time instead of one after the other.
      // No pagination on this backend, so each response is a plain array.
      const [lessonData, courseData] = await Promise.all([
        lessons.list(),
        courses.list(),
      ])
      setRows(lessonData)
      setCourseRows(courseData)
    } catch (err) {
      setError(err.text || 'Could not load lessons')
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
      // row.course is a number. The <select> compares against strings,
      // so turn it into one or the dropdown will look empty.
      course: row.course ? String(row.course) : '',
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

    // The form holds the course id as a string. Django wants a number.
    // If nothing was picked we send null and let the backend say so.
    const payload = {
      title: form.title,
      description: form.description,
      course: form.course === '' ? null : Number(form.course),
    }

    try {
      if (editingId) {
        await lessons.update(editingId, payload)
      } else {
        await lessons.create(payload)
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
    if (!window.confirm(`Delete lesson "${row.title}"?`)) return
    setError('')
    try {
      await lessons.remove(row.id)
      await load()
    } catch (err) {
      setError(err.text || 'Could not delete')
    }
  }

  // ---- 6. the screen ----------------------------------------------------

  // The API only gives us the course id, so look the title up ourselves.
  // If the course was deleted we still show something, e.g. "#7".
  const courseTitle = (id) => courseRows.find((c) => c.id === id)?.title ?? `#${id}`

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="block max-w-xs truncate text-slate-600">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (row) => courseTitle(row.course),
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
      <PageHeader title="Lessons" subtitle="The lessons that make up each course." />

      <Alert kind="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit lesson #${editingId}` : 'New lesson'}
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

                {/* The value of every option is a course id. That is the
                    number the backend stores. */}
                <Field label="Course" error={fieldErrors.course}>
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
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create lesson'}
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
        title={`${rows.length} lesson${rows.length === 1 ? '' : 's'}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add lesson
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No lessons yet." />
        )}
      </Card>
    </div>
  )
}
