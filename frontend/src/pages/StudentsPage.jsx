// ---------------------------------------------------------------------------
// THE PATTERN PAGE.
//
// Every other resource page in this app is the same six steps as this one:
//   1. state for the rows, the form, and the errors
//   2. load() reads the list from the API
//   3. useEffect() calls load() once when the page opens
//   4. handleSubmit() creates a new row, or updates the row being edited
//   5. handleDelete() asks for confirmation, then deletes
//   6. the JSX: error banner, form, table
//
// Read this file first. The others will then look familiar.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { students } from '../api'
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Spinner,
  Table,
} from '../components/ui'

// The shape of one empty form. Keeping it here means "reset the form" is
// just setForm(EMPTY_FORM).
const EMPTY_FORM = {
  name: '',
  email: '',
  enrollment_date: '',
  roll_number: '',
  is_active: true,
}

export default function StudentsPage() {
  // ---- 1. state --------------------------------------------------------
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null) // null means "creating"
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // ---- 2. read the list ------------------------------------------------
  async function load() {
    setLoading(true)
    setError('')
    try {
      // No pagination on this backend, so the response is a plain array.
      const data = await students.list()
      setRows(data)
    } catch (err) {
      setError(err.text || 'Could not load students')
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
      name: row.name ?? '',
      email: row.email ?? '',
      enrollment_date: row.enrollment_date ?? '',
      roll_number: row.roll_number ?? '',
      is_active: row.is_active,
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
      if (editingId) {
        await students.update(editingId, form)
      } else {
        await students.create(form)
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
    if (!window.confirm(`Delete student "${row.name}"?`)) return
    setError('')
    try {
      await students.remove(row.id)
      await load()
    } catch (err) {
      setError(err.text || 'Could not delete')
    }
  }

  // ---- 6. the screen ----------------------------------------------------
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'roll_number', label: 'Roll no.' },
    { key: 'enrollment_date', label: 'Enrolled' },
    {
      key: 'is_active',
      label: 'Active',
      render: (row) => (row.is_active ? 'Yes' : 'No'),
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
      <PageHeader title="Students" subtitle="Everyone enrolled in the school." />

      <Alert kind="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {showForm && (
        <div className="mb-6">
          <Card
            title={editingId ? `Edit student #${editingId}` : 'New student'}
            action={
              <Button variant="ghost" onClick={cancelForm}>
                <X size={14} />
              </Button>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={fieldErrors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </Field>

                <Field label="Email" error={fieldErrors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </Field>

                <Field label="Roll number" error={fieldErrors.roll_number}>
                  <Input
                    value={form.roll_number}
                    onChange={(e) => update('roll_number', e.target.value)}
                  />
                </Field>

                {/* Django wants a plain YYYY-MM-DD string here, which is
                    exactly what <input type="date"> produces. */}
                <Field
                  label="Enrollment date (required)"
                  error={fieldErrors.enrollment_date}
                >
                  <Input
                    type="date"
                    value={form.enrollment_date}
                    onChange={(e) => update('enrollment_date', e.target.value)}
                    required
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active
              </label>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create student'}
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
        title={`${rows.length} student${rows.length === 1 ? '' : 's'}`}
        action={
          !showForm && (
            <Button onClick={startCreate}>
              <Plus size={14} />
              Add student
            </Button>
          )
        }
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={rows} empty="No students yet." />
        )}
      </Card>
    </div>
  )
}
