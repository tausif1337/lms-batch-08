// Register screen. No account is created — submitting just walks you to the
// dashboard so the flow stays clickable.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button, Field, Input } from "../components/ui";

const EMPTY = {
  username: "",
  email: "",
  password: "",
  phone: "",
  first_name: "",
  last_name: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <Input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Username">
            <Input
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="01711110001"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </Field>

          <Button type="submit" className="w-full">
            Create account
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
