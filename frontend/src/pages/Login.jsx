import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LoaderCircle, Lock, LogIn, Phone } from "lucide-react";
import { ErrorMessage } from "../components/Message.jsx";
import { login } from "../api.js";
import { saveLoggedInUser } from "../auth.js";

const INPUT_STYLE =
  "w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const ICON_INSIDE_INPUT_STYLE =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

const PASSWORD_OF_EVERY_DEMO_ACCOUNT = "Demo@12345";

const DEMO_ACCOUNTS = [
  { role: "Admin", phone: "01700000010" },
  { role: "Teacher", phone: "01700000011" },
  { role: "Student", phone: "01700000012" },
];

function DemoAccountList({ onPick }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
      <p className="text-xs font-semibold text-amber-800">Demo accounts (dev only)</p>

      <div className="mt-2 space-y-1">
        {DEMO_ACCOUNTS.map(account => (
          <button
            key={account.phone}
            type="button"
            onClick={() => onPick(account.phone)}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs text-amber-900 hover:bg-amber-100"
          >
            <span className="font-medium">{account.role}</span>
            <span className="font-mono">{account.phone}</span>
          </button>
        ))}
      </div>

      <p className="mt-2 px-2 text-xs text-amber-700">
        Password <span className="font-mono">{PASSWORD_OF_EVERY_DEMO_ACCOUNT}</span> — click a row
        to fill.
      </p>
    </div>
  );
}

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const goToPage = useNavigate();

  function fillInDemoAccount(demoPhone) {
    setPhone(demoPhone);
    setPassword(PASSWORD_OF_EVERY_DEMO_ACCOUNT);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSigningIn(true);

    try {
      const answer = await login(phone.trim(), password);

      saveLoggedInUser(answer.tokens, {
        user_id: answer.user_id,
        username: answer.username,
        role: answer.role,
      });

      goToPage("/dashboard", { replace: true });
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your LMS account</p>
        </div>

        <ErrorMessage className="mb-4">{errorMessage}</ErrorMessage>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className={ICON_INSIDE_INPUT_STYLE} />
            <input
              required
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              className={INPUT_STYLE}
            />
          </div>

          <div className="relative">
            <Lock className={ICON_INSIDE_INPUT_STYLE} />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className={INPUT_STYLE}
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={isSigningIn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSigningIn ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        {import.meta.env.DEV && <DemoAccountList onPick={fillInDemoAccount} />}

        <p className="mt-6 text-center text-xs text-slate-500">
          Accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}
