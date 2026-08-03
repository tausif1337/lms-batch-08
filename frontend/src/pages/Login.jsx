import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../auth.js";
import { Alert, Button, Input } from "../components/index.js";

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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      // The backend looks you up by phone number, not by username.
      await logIn(phone, password);
      navigate(goBackTo, { replace: true });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
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

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
