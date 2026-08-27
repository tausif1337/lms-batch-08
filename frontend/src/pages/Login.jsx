import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api.js";
import { saveLogin } from "../auth.js";

const inputClass = "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function Login() {
  const [phone, setPhone] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await login(phone.trim(), password); saveLogin(data.tokens.access, { user_id: data.user_id, username: data.username, role: data.role }); navigate("/dashboard", { replace: true }); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"><div className="mb-6"><div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">L</div><h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-slate-500">Sign in to your LMS account</p></div>{error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<form onSubmit={handleSubmit} className="space-y-4"><input required type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} /><input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /><div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-indigo-600">Forgot password?</Link></div><button disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button></form><p className="mt-6 text-center text-xs text-slate-500">Accounts are created by an administrator.</p></div></div>;
}
