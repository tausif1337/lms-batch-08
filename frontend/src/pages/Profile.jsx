import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle, Save, ShieldCheck, UserRound } from "lucide-react";
import { changePassword, getProfile, updateProfile } from "../api.js";
import { clearLogin, getUser, setUser } from "../auth.js";
import { useNavigate } from "react-router-dom";

const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function Profile() {
  const cached = getUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: cached?.first_name || "", last_name: cached?.last_name || "", email: cached?.email || "", phone: cached?.phone || "" });
  const [password, setPassword] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [role, setRole] = useState(cached?.role || ""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);

  useEffect(() => { getProfile().then(data => { const u = data.user; setForm({ first_name: u.first_name || "", last_name: u.last_name || "", email: u.email || "", phone: u.phone || "" }); setRole(u.role); setUser(u); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const save = async e => { e.preventDefault(); setError(""); setMessage(""); try { const data = await updateProfile(form); setUser(data.user); setRole(data.user.role); setMessage(data.message); } catch (e) { setError(e.message); } };
  const savePassword = async e => { e.preventDefault(); setError(""); setMessage(""); try { const data = await changePassword(password); clearLogin(); setMessage(data.detail || "Password changed. Please log in again."); setTimeout(() => navigate("/login", { replace: true }), 1000); } catch (e) { setError(e.message); } };

  return <Layout title="Profile"><div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">{loading ? <div className="flex items-center gap-2 text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading profile...</div> : <>
    <form onSubmit={save} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-semibold"><UserRound className="h-5 w-5 text-indigo-600" />Personal details</h2><p className="mb-5 mt-1 text-sm text-slate-500">Update the information attached to your account.</p><div className="grid gap-4 sm:grid-cols-2">{[["first_name","First name"],["last_name","Last name"],["email","Email"],["phone","Phone"]].map(([key,label]) => <label key={key} className="text-sm font-medium">{label}<input required={key !== "last_name"} type={key === "email" ? "email" : "text"} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={input} /></label>)}</div><div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm"><ShieldCheck className="h-4 w-4 text-slate-500" />Role: <strong className="capitalize">{role}</strong></div><button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Save className="h-4 w-4" />Save profile</button></form>
    <form onSubmit={savePassword} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5 text-indigo-600" />Change password</h2><p className="mb-5 mt-1 text-sm text-slate-500">You will need to log in again after changing it.</p>{[["current_password","Current password"],["new_password","New password"],["confirm_password","Confirm new password"]].map(([key,label]) => <label key={key} className="mb-4 block text-sm font-medium">{label}<input required type="password" value={password[key]} onChange={e => setPassword({ ...password, [key]: e.target.value })} className={input} /></label>)}<button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"><KeyRound className="h-4 w-4" />Change password</button></form>
  </>}</div>{(message || error) && <div className={`mx-auto mt-5 flex max-w-5xl items-start gap-2 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{error || message}</div>}</Layout>;
}
