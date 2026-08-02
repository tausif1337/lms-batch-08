// Login screen. There is no authentication in this build — the form is here
// for its looks, and submitting it simply walks you to the dashboard.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button, Field, Input } from "../components/ui";

export default function LoginPage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Log in to LMS
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Phone number">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01711110001"
              autoComplete="tel"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>

          <Button type="submit" className="w-full">
            Log in
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
