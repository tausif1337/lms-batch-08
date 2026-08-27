import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api.js";

export default function PasswordReset() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); setError(""); setMessage(""); try { const data = await requestPasswordReset(email); setMessage(data.detail); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  return <AuthShell title="Forgot password" subtitle="Enter your email and we will send a reset link."><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-indigo-500" /></label>{message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button><Link to="/login" className="block text-center text-sm font-medium text-indigo-600">Back to login</Link></form></AuthShell>;
}

function AuthShell({ title, subtitle, children }) { return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-lg"><h1 className="text-2xl font-bold">{title}</h1><p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>{children}</div></div>; }
