import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { register } from "../api.js";
import Alert from "../components/Alert.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Select from "../components/Select.jsx";

// What an empty form looks like. Kept out of the component so that clearing
// the form after a save is one assignment instead of seven.
const BLANK = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "student",
};

export default function Register() {
  const [values, setValues] = useState(BLANK);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // One handler for every box. Each Input carries a `name` that matches the
  // key the serializer expects, so nothing has to be renamed on the way out.
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      // The request carries the admin's own token, added by the interceptor
      // in api.js. Anonymous, this call comes back 403.
      const created = await register(values);

      setSuccess(
        `Account created for ${created.username} as ${created.role}. ` +
          `They log in with the phone number, not the username.`,
      );

      // Blank the form so the next account does not inherit this one's
      // details — the phone number and username both have to be unique.
      setValues(BLANK);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back
        </Link>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {/* The icon sits in a flex row with the title only. Put the
              subtitle in that row too and it lands beside the heading
              instead of under it. */}
          <div className="mb-1 flex items-center gap-2">
            <UserPlus size={22} className="shrink-0 text-indigo-600" />
            <h1 className="text-xl font-semibold text-slate-900">
              Create an account
            </h1>
          </div>

          <p className="mb-6 text-sm text-slate-500">
            Admins only. Pick the role now — nobody can promote themselves
            later.
          </p>

          <Alert onDismiss={() => setError("")}>{error}</Alert>
          <Alert variant="success" onDismiss={() => setSuccess("")}>
            {success}
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                name="first_name"
                required
                value={values.first_name}
                onChange={handleChange}
              />

              {/* The only optional field on the serializer. */}
              <Input
                label="Last name"
                name="last_name"
                value={values.last_name}
                onChange={handleChange}
              />

              <Input
                label="Username"
                name="username"
                required
                autoComplete="off"
                value={values.username}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={values.email}
                onChange={handleChange}
              />

              {/* This is what they will type on the login page, so it has to
                  be unique across every profile. */}
              <Input
                label="Phone number"
                name="phone"
                required
                placeholder="01711110001"
                value={values.phone}
                onChange={handleChange}
              />

              <Select
                label="Role"
                name="role"
                value={values.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Select>

              <Input
                label="Password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="sm:col-span-2"
                value={values.password}
                onChange={handleChange}
              />
            </div>

            {/* Django's own password rules run on the server. A short or
                common password comes back as a "password: ..." line in the
                red box above rather than being caught here. */}
            <Button
              type="submit"
              disabled={isSaving}
              className="mt-5 w-full justify-center disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
