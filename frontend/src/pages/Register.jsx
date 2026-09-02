import { useState } from "react";
import Layout from "../components/Layout.jsx";
import { AlertCircle, AtSign, CheckCircle2, IdCard, KeyRound, LoaderCircle, Phone, ShieldCheck, User, UserPlus } from "lucide-react";
import { register } from "../api.js";

// The route already turns anyone who is not an admin away, so this page only
// has to worry about the form.
// Each field carries its own icon, so the control is indented to leave room.
const inputClass = "mt-1 w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const iconClass = "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

const blank = { first_name: "", last_name: "", username: "", email: "", phone: "", role: "student", password: "" };

const fields = [
  ["first_name", "First name", "text", true, User],
  ["last_name", "Last name", "text", false, User],
  ["username", "Username", "text", true, IdCard],
  ["email", "Email", "email", true, AtSign],
  ["phone", "Phone number", "tel", true, Phone],
  ["password", "Password", "password", true, KeyRound],
];

export default function Register() {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const data = await register(form);
      setSuccess(`Account created for ${data.username} as ${data.role}.`);
      setForm(blank);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return <Layout title="Create account">
    <div className="mx-auto max-w-2xl">
      <div className="mb-6"><p className="text-sm text-slate-500">LMS management</p><h2 className="text-2xl font-bold">Create account</h2><p className="mt-1 text-sm text-slate-500">Add a new student, teacher or admin. They sign in with the phone number you set here.</p></div>

      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, type, required, Icon]) => <label key={key} className="text-sm font-medium text-slate-700">{label}
            <span className="relative mt-1 block"><Icon className={iconClass} /><input required={required} type={type} value={form[key]} onChange={e => set(key, e.target.value)} className={`${inputClass} mt-0`} /></span>
          </label>)}

          <label className="text-sm font-medium text-slate-700">Role
            <span className="relative mt-1 block"><ShieldCheck className={iconClass} /><select value={form.role} onChange={e => set("role", e.target.value)} className={`${inputClass} mt-0`}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select></span>
          </label>
        </div>

        {error && <p className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {success && <p className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}</p>}

        <button type="submit" disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creating...</> : <><UserPlus className="h-4 w-4" />Create account</>}
        </button>
      </form>
    </div>
  </Layout>;
}
