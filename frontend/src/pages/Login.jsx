import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../auth.js";
import { Alert, Button, Input } from "../components/index.js";

// Seeded local accounts, shown only while running `npm run dev`. Vite replaces
// import.meta.env.DEV with false in a production build, so the whole block and
// this list are dropped from the bundle.
const DEMO_ACCOUNTS = [
  { label: "Admin", phone: "01700000000", password: "admin1234" },
];

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logIn } = useAuth();

  // ProtectedRoute stores the page you were trying to reach here.
  const goBackTo = location.state?.from ?? "/";

  async function logInWith(phoneToUse, passwordToUse) {
    setError("");
    setIsSaving(true);

    try {
      // The backend looks you up by phone number, not by username.
      await logIn(phoneToUse, passwordToUse);
      navigate(goBackTo, { replace: true });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    logInWith(phone, password);
  }

  function handleDemoLogin(account) {
    // Fill the fields too, so it is obvious what was used.
    setPhone(account.phone);
    setPassword(account.password);
    logInWith(account.phone, account.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Log in to LMS</h1>
        </div>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Phone number"
              placeholder="01711110001"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="mt-4 w-full justify-center disabled:opacity-60"
          >
            {isSaving ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-5 rounded-md border border-dashed border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-900">
              Dev only — seeded accounts
            </p>

            <div className="mt-2 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.phone}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800">
                      {account.label}
                    </p>
                    <p className="truncate font-mono text-xs text-slate-600">
                      {account.phone} / {account.password}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => handleDemoLogin(account)}
                    className="shrink-0 px-2 py-1 text-xs disabled:opacity-60"
                  >
                    Log in
                  </Button>
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-amber-800">
              Hidden in production builds.
            </p>
          </div>
        )}

        {/* There is no sign-up link. Accounts are handed out by an admin. */}
        <p className="mt-4 text-center text-sm text-slate-500">
          No account? Ask an admin to make you one.
        </p>
      </div>
    </div>
  );
}
