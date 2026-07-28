import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { auth } from "../api";
import { useAuth } from "../AuthContext";
import { Alert, Button, Field, Input } from "../components/ui";

const EMPTY = {
  username: "",
  email: "",
  password: "",
  phone: "",
  first_name: "",
  last_name: "",
};

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      await auth.register(form);
      // Registering does NOT return a token, so we log in straight after
      // using the phone number that was just typed into this form.
      await login(form.phone, form.password);
      navigate("/");
    } catch (err) {
      setError(err.text || "Registration failed");
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Create an account
          </h1>
        </div>

        <Alert kind="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={fieldErrors.first_name}>
              <Input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required
              />
            </Field>
            <Field label="Last name" error={fieldErrors.last_name}>
              <Input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Username" error={fieldErrors.username}>
            <Input
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
            />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Phone (you will log in with this)"
            error={fieldErrors.phone}
          >
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="01711110001"
              required
            />
          </Field>

          <Field label="Password" error={fieldErrors.password}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </Field>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
