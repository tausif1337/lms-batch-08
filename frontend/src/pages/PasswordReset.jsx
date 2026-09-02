import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, AtSign, CheckCircle2, LoaderCircle, Mail, Send } from "lucide-react";
import { requestPasswordReset } from "../api.js";

export default function PasswordReset() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); setError(""); setMessage(""); try { const data = await requestPasswordReset(email); setMessage(data.detail); } catch (e) { setError(e.message); } finally { setLoading(false); } };

  return <AuthShell icon={Mail} title="Forgot password" subtitle="Enter your email and we will send a reset link.">
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium">Email
        <span className="relative mt-1 block">
          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </span>
      </label>

      {message && <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
      {error && <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

      <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send reset link</>}
      </button>

      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"><ArrowLeft className="h-4 w-4" />Back to login</Link>
    </form>
  </AuthShell>;
}

function AuthShell({ icon: Icon, title, subtitle, children }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-lg">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
      {children}
    </div>
  </div>;
}
