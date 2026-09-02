import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Inbox, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { createResource, deleteResource, listResource, updateResource } from "../api.js";
import { getUser } from "../auth.js";

// Foreign keys arrive from the API as bare ids. Each entry says which list to
// pull the choices from and how to name a row, so the form can offer a
// dropdown instead of asking somebody to memorise primary keys.
const relations = {
  teacher: { resource: "teachers", label: r => r.name || `Teacher #${r.id}` },
  student: { resource: "students", label: r => r.name || `Student #${r.id}` },
  course: { resource: "courses", label: r => r.title || `Course #${r.id}` },
  lesson: { resource: "lessons", label: r => r.title || `Lesson #${r.id}` },
  assignment: { resource: "assignments", label: r => r.title || `Assignment #${r.id}` },
  submission: { resource: "submissions", label: r => `Submission #${r.id}` },
};

// `create` and `modify` are two lists because the API draws the line there: a
// student may POST a submission but may not PATCH or DELETE one, so showing
// them an Edit button would only earn a 403. `columns` is only spelled out
// where the table shows something the form does not send back.
const config = {
  teachers: { title: "Teachers", singular: "Teacher", fields: ["name", "email", "subject", "is_active"], create: ["admin"], modify: ["admin"] },
  students: { title: "Students", singular: "Student", fields: ["name", "email", "enrollment_date", "is_active", "roll_number"], columns: ["account", "name", "email", "enrollment_date", "is_active", "roll_number"], create: ["admin"], modify: ["admin"] },
  courses: { title: "Courses", singular: "Course", fields: ["title", "description", "teacher"], create: ["admin", "teacher"], modify: ["admin", "teacher"] },
  enrollments: { title: "Enrollments", singular: "Enrollment", fields: ["student", "course"], columns: ["student", "course", "enrollment_date"], create: ["admin", "teacher"], modify: ["admin", "teacher"] },
  lessons: { title: "Lessons", singular: "Lesson", fields: ["title", "description", "course"], create: ["admin", "teacher"], modify: ["admin", "teacher"] },
  assignments: { title: "Assignments", singular: "Assignment", fields: ["title", "description", "lesson", "course", "due_date"], create: ["admin", "teacher"], modify: ["admin", "teacher"] },
  submissions: { title: "Submissions", singular: "Submission", fields: ["assignment", "student", "content"], columns: ["assignment", "student", "content", "submitted_at"], create: ["admin", "teacher", "student"], modify: ["admin", "teacher"], serverFills: { student: ["student"] } },
  results: { title: "Results", singular: "Result", fields: ["submission", "score", "feedback"], create: ["admin", "teacher"], modify: ["admin", "teacher"] },
};

const labels = { is_active: "Active", due_date: "Due date", roll_number: "Roll number", enrollment_date: "Enrolled on", submitted_at: "Submitted at", account: "Account" };
const pretty = key => labels[key] || key.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const empty = fields => Object.fromEntries(fields.map(f => [f, f === "is_active" ? true : ""]));
const rowsOf = data => (Array.isArray(data) ? data : data?.results || []);

// Run a promise to completion without letting a rejection escape, so callers
// can wait on several at once and handle each outcome separately.
const attempt = promise => promise.then(value => ({ ok: true, value }), error => ({ ok: false, error }));

// <input type="datetime-local"> speaks "YYYY-MM-DDTHH:mm" in the browser's own
// timezone, while the API stores UTC. These two convert between the pair.
const pad = n => String(n).padStart(2, "0");
function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function fromLocalInput(value) {
  if (!value) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export default function ResourcePage({ resource }) {
  const cfg = config[resource];
  const user = getUser();
  const canCreate = cfg.create.includes(user?.role);
  const canModify = cfg.modify.includes(user?.role);
  const columns = useMemo(() => cfg.columns || cfg.fields, [cfg]);
  const formFields = useMemo(
    () => cfg.fields.filter(field => !(cfg.serverFills?.[user?.role] || []).includes(field)),
    [cfg, user?.role],
  );

  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(() => empty(formFields));
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Every field that names another table, whether it is on the form, the
  // table, or both.
  const linked = useMemo(
    () => [...new Set([...formFields, ...columns])].filter(field => relations[field]),
    [formFields, columns],
  );

  // A dropdown that fails to load is not worth failing the page over: the
  // column falls back to showing the raw id.
  async function fetchOptions(fields) {
    const entries = await Promise.all(fields.map(async field => {
      try { return [field, { rows: rowsOf(await listResource(relations[field].resource)), failed: false }]; }
      catch { return [field, { rows: [], failed: true }]; }
    }));
    return Object.fromEntries(entries);
  }

  // The first load. The route gives this component a key of the resource
  // name, so switching lists remounts it and every piece of state above
  // starts over rather than being reset by hand here.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Settled, not all: a failing row list must not stop the dropdown
      // choices from being recorded, or the selects sit on "Loading..."
      // for ever with no way to tell the user what went wrong.
      const [list, choices] = await Promise.all([attempt(listResource(resource)), fetchOptions(linked)]);
      if (cancelled) return;

      setOptions(choices);
      if (list.ok) setRows(rowsOf(list.value));
      else setError(list.error.message);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [resource, linked]);

  // Used by the Refresh button and after a write. A write can add a row that
  // belongs in somebody else's dropdown, so it reloads the choices too.
  async function refresh(withOptions = false) {
    setLoading(true); setError("");

    const [list, choices] = await Promise.all([attempt(listResource(resource)), withOptions ? fetchOptions(linked) : null]);

    if (choices) setOptions(choices);
    if (list.ok) setRows(rowsOf(list.value));
    else setError(list.error.message);
    setLoading(false);
  }

  const reset = () => { setEditing(null); setForm(empty(formFields)); };

  const submit = async e => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = Object.fromEntries(formFields.map(field => [
      field,
      field === "due_date" ? fromLocalInput(form[field]) : form[field],
    ]));
    try {
      if (editing) await updateResource(resource, editing.id, payload);
      else await createResource(resource, payload);
      reset();
      await refresh(true);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm("Delete this record?")) return;
    setError("");
    try { await deleteResource(resource, id); await refresh(); } catch (e) { setError(e.message); }
  };

  const edit = row => {
    setEditing(row);
    setForm(Object.fromEntries(formFields.map(field => [
      field,
      field === "due_date" ? toLocalInput(row[field]) : row[field] ?? "",
    ])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function display(field, value) {
    if (relations[field]) {
      const match = (options[field]?.rows || []).find(o => String(o.id) === String(value));
      return match ? relations[field].label(match) : value === null || value === undefined || value === "" ? "" : `#${value}`;
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (field === "submitted_at" || field === "due_date") return value ? new Date(value).toLocaleString() : "";
    if (typeof value === "object" && value !== null) return JSON.stringify(value);
    return String(value ?? "");
  }

  const actionColumns = columns.length + (canModify ? 1 : 0);

  return <Layout title={cfg.title}>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">LMS management</p><h2 className="text-2xl font-bold">{cfg.title}</h2></div><button onClick={() => refresh(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>

    {!canCreate && !canModify && <p className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600"><Eye className="h-4 w-4 shrink-0" />You can read this list. Changing it is not something your role allows.</p>}

    {resource === "submissions" && user?.role === "student" && <p className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600"><Eye className="h-4 w-4 shrink-0" />This is your own work only. Handing in files it under your account; after that only a teacher can change it.</p>}

    {canCreate && <form onSubmit={submit} className="mb-6 rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{editing ? `Edit ${cfg.singular}` : `Add ${cfg.singular}`}</h3>{editing && <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><X className="h-4 w-4" />Cancel</button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {formFields.map(field => <label key={field} className="text-sm font-medium text-slate-700">{pretty(field)}<Field field={field} value={form[field]} options={options[field]} onChange={v => setForm({ ...form, [field]: v })} /></label>)}
    </div><button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : editing ? <><Save className="h-4 w-4" />Save changes</> : <><Plus className="h-4 w-4" />Create</>}</button></form>}

    {error && <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{columns.map(c => <th key={c} className="px-4 py-3">{pretty(c)}</th>)}{canModify && <th className="px-4 py-3">Actions</th>}</tr></thead><tbody className="divide-y">{loading ? <tr><td colSpan={actionColumns} className="px-4 py-10 text-center text-slate-500"><span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading...</span></td></tr> : rows.length === 0 ? <tr><td colSpan={actionColumns} className="px-4 py-10 text-center text-slate-500"><span className="inline-flex flex-col items-center gap-2"><Inbox className="h-6 w-6 text-slate-400" />No records found.</span></td></tr> : rows.map(row => <tr key={row.id} className="hover:bg-slate-50">{columns.map(c => <td key={c} className="max-w-xs px-4 py-3 align-top">{display(c, row[c])}</td>)}{canModify && <td className="px-4 py-3 whitespace-nowrap"><button onClick={() => edit(row)} className="mr-3 inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800"><Pencil className="h-3.5 w-3.5" />Edit</button><button onClick={() => remove(row.id)} className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-800"><Trash2 className="h-3.5 w-3.5" />Delete</button></td>}</tr>)}</tbody></table></div></div>
  </Layout>;
}

function Field({ field, value, options, onChange }) {
  const common = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  if (relations[field]) {
    const { rows: choices = [], failed = false } = options || {};
    const noun = pretty(field).toLowerCase();

    // Three states that used to look identical: still loading, loaded but
    // empty, and could not load at all.
    const placeholder = !options ? "Loading..."
      : failed ? `Could not load ${noun}s`
      : choices.length ? `Select ${noun}`
      : `No ${noun}s yet — add one first`;

    return <select required disabled={!choices.length} value={value ?? ""} onChange={e => onChange(e.target.value)} className={`${common} disabled:bg-slate-50 disabled:text-slate-500`}>
      <option value="">{placeholder}</option>
      {choices.map(choice => <option key={choice.id} value={choice.id}>{relations[field].label(choice)}</option>)}
    </select>;
  }

  if (field === "is_active") return <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} className="mt-3 h-4 w-4" />;
  if (["description", "content", "feedback"].includes(field)) return <textarea required rows="3" value={value} onChange={e => onChange(e.target.value)} className={common} />;
  if (field === "score") return <input required type="number" step="any" min="0" value={value} onChange={e => onChange(e.target.value)} className={common} />;
  if (field === "due_date") return <input required type="datetime-local" value={value} onChange={e => onChange(e.target.value)} className={common} />;

  return <input required={field !== "roll_number"} type={field.includes("date") ? "date" : field === "email" ? "email" : "text"} value={value} onChange={e => onChange(e.target.value)} className={common} />;
}
