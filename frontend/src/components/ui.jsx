// ---------------------------------------------------------------------------
// Small reusable pieces so the pages stay short and readable.
// Plain Tailwind classes, nothing clever.
// ---------------------------------------------------------------------------

import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

export function Input(props) {
  return <input className={inputClass} {...props} />
}

export function Textarea(props) {
  return <textarea rows={3} className={inputClass} {...props} />
}

// A dropdown for choosing a related row (a course, a teacher, ...).
// The backend expects a plain id number, so that is what we send.
export function Select({ options, placeholder = 'Select...', ...props }) {
  return (
    <select className={inputClass} {...props}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Alert({ kind = 'error', children, onClose }) {
  if (!children) return null
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  }
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2
  return (
    <div
      className={`mb-4 flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${styles[kind]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  )
}

export function Card({ title, action, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

// A simple table. `columns` is a list of { key, label, render? }.
export function Table({ columns, rows, empty = 'Nothing here yet.' }) {
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-slate-500">{empty}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top text-slate-700">
                  {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}
