import { useState } from "react";
import { UserPlus } from "lucide-react";
import { register } from "../api.js";
import { useFlash } from "../flash.js";
import {
  Alert,
  Button,
  Input,
  PageHeader,
  Select,
} from "../components/index.js";

// Creating an account is an admin job: there is no public sign-up. This page
// sits behind ProtectedRoute role="admin", and /api/register/ refuses anyone
// who is not an admin even if they get here another way.
export default function Accounts() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [error, setError] = useState("");
  const [notice, setNotice] = useFlash(8000);
  const [isSaving, setIsSaving] = useState(false);

  function clearForm() {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("student");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await register({
        username,
        email,
        password,
        phone,
        role,
        first_name: firstName,
        last_name: lastName,
      });

      // Deliberately not logged in as the new person: the admin who filled
      // this in stays signed in as themselves.
      setNotice(
        `Account created for ${username} as a ${role}. They log in with the phone number ${phone}.`,
      );
      clearForm();
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Create a login for a student, a teacher, or another admin."
      />

      <Alert>{error}</Alert>
      <Alert variant="success">{notice}</Alert>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-800">
          New account
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />

          <Input
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />

          <Input
            label="Username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label="Phone"
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

          <Select
            label="Role"
            required
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="student">Student — read only, may hand work in</option>
            <option value="teacher">
              Teacher — course material, enrollments and grading
            </option>
            <option value="admin">Admin — everything, including accounts</option>
          </Select>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          They sign in with the <strong>phone number</strong>, not the username.
        </p>

        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={isSaving}>
            <UserPlus size={14} />
            {isSaving ? "Creating..." : "Create account"}
          </Button>
          <Button variant="secondary" onClick={clearForm} disabled={isSaving}>
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
