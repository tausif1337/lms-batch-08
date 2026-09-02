import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle, Lock, LogIn } from "lucide-react";
import { confirmPasswordReset } from "../api.js";

const inputClass = "w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const iconClass = "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

export default function ResetPassword() {
  const [params] = useSearchParams(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setLoading(true); setError(""); try { const data = await confirmPasswordReset({ uid: params.get("uid"), token: params.get("token"), new_password: password, confirm_password: confirm }); setMessage(data.detail); } catch (e) { setError(e.message); } finally { setLoading(false); } };

  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-lg">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><KeyRound className="h-5 w-5" /></div>
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Choose a new password for your account.</p>

      {message ? <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>
        <Link to="/login" className="flex items-center justify-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800"><LogIn className="h-4 w-4" />Go to login</Link>
      </div> : <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">New password
          <span className="relative mt-1 block"><Lock className={iconClass} /><input required minLength="8" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></span>
        </label>
        <label className="block text-sm font-medium">Confirm password
          <span className="relative mt-1 block"><Lock className={iconClass} /><input required minLength="8" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass} /></span>
        </label>

        {error && <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

        <button disabled={loading || !params.get("uid") || !params.get("token")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Updating...</> : <><KeyRound className="h-4 w-4" />Reset password</>}
        </button>
      </form>}
    </div>
  </div>;
}
