import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../auth.js";
import { Alert, Button, Input } from "../components/index.js";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      // Registering does not return a token, so signUp() logs in straight
      // afterwards using the phone number typed here.
      await signUp({
        username,
        email,
        password,
        phone,
        first_name: firstName,
        last_name: lastName,
      });
      navigate("/", { replace: true });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <GraduationCap size={26} className="text-indigo-600" />
          <span className="text-xl font-semibold text-slate-900">LMS</span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-lg font-semibold text-slate-900">
            Create an account
          </h1>

          <Alert>{error}</Alert>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
              </div>

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
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full justify-center disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
