import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import { createResource, deleteResource, listResource, updateResource } from "../api.js";
import { getUser } from "../auth.js";

const config = {
  teachers: { title: "Teachers", fields: ["name", "email", "subject", "is_active"], write: ["admin"] },
  students: { title: "Students", fields: ["name", "email", "enrollment_date", "is_active", "roll_number"], write: ["admin"] },
  courses: { title: "Courses", fields: ["title", "description", "teacher"], write: ["admin", "teacher"] },
  enrollments: { title: "Enrollments", fields: ["student", "course"], write: ["admin", "teacher"] },
  lessons: { title: "Lessons", fields: ["title", "description", "course"], write: ["admin", "teacher"] },
  assignments: { title: "Assignments", fields: ["title", "description", "lesson", "due_date", "course"], write: ["admin", "teacher"] },
  submissions: { title: "Submissions", fields: ["assignment", "student", "content"], write: ["admin", "teacher", "student"] },
  results: { title: "Results", fields: ["submission", "score", "feedback"], write: ["admin", "teacher"] },
};

const labels = { is_active: "Active", due_date: "Due date", roll_number: "Roll number" };
const pretty = key => labels[key] || key.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const empty = fields => Object.fromEntries(fields.map(f => [f, f === "is_active" ? true : ""]));

export default function ResourcePage({ resource }) {
  const cfg = config[resource];
  const user = getUser();
  const canWrite = cfg.write.includes(user?.role);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty(cfg.fields));
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { const data = await listResource(resource); setRows(Array.isArray(data) ? data : data.results || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [resource]);

  const columns = useMemo(() => cfg.fields, [cfg.fields]);
  const reset = () => { setEditing(null); setForm(empty(cfg.fields)); };
  const submit = async e => {
    e.preventDefault(); setSaving(true); setError("");
    try { editing ? await updateResource(resource, editing.id, form) : await createResource(resource, form); reset(); await load(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm("Delete this record?")) return;
    try { await deleteResource(resource, id); await load(); } catch (e) { setError(e.message); }
  };
  const edit = row => { setEditing(row); setForm(Object.fromEntries(cfg.fields.map(f => [f, row[f] ?? ""]))); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const display = value => typeof value === "boolean" ? (value ? "Yes" : "No") : typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");

  return <Layout title={cfg.title}>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-500">LMS management</p><h2 className="text-2xl font-bold">{cfg.title}</h2></div><button onClick={load} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Refresh</button></div>
    {canWrite && <form onSubmit={submit} className="mb-6 rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{editing ? `Edit ${cfg.title.slice(0, -1)}` : `Add ${cfg.title.slice(0, -1)}`}</h3>{editing && <button type="button" onClick={reset} className="text-sm text-slate-500">Cancel</button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cfg.fields.map(field => <label key={field} className="text-sm font-medium text-slate-700">{pretty(field)}<Field field={field} value={form[field]} onChange={v => setForm({ ...form, [field]: v })} /></label>)}
    </div><button disabled={saving} className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editing ? "Save changes" : "Create"}</button></form>}
    {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{columns.map(c => <th key={c} className="px-4 py-3">{pretty(c)}</th>)}{canWrite && <th className="px-4 py-3">Actions</th>}</tr></thead><tbody className="divide-y">{loading ? <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">Loading...</td></tr> : rows.length === 0 ? <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">No records found.</td></tr> : rows.map(row => <tr key={row.id} className="hover:bg-slate-50">{columns.map(c => <td key={c} className="max-w-xs px-4 py-3 align-top">{display(row[c])}</td>)}{canWrite && <td className="px-4 py-3 whitespace-nowrap"><button onClick={() => edit(row)} className="mr-3 font-medium text-indigo-600">Edit</button><button onClick={() => remove(row.id)} className="font-medium text-red-600">Delete</button></td>}</tr>)}</tbody></table></div></div>
  </Layout>;
}

function Field({ field, value, onChange }) {
  const common = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  if (field === "is_active") return <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} className="mt-3 h-4 w-4" />;
  if (["description", "content", "feedback"].includes(field)) return <textarea required rows="3" value={value} onChange={e => onChange(e.target.value)} className={common} />;
  return <input required={field !== "roll_number"} type={field === "due_date" ? "datetime-local" : field.includes("date") ? "date" : field === "email" ? "email" : field === "score" ? "number" : "text"} value={value} onChange={e => onChange(e.target.value)} className={common} />;
}
