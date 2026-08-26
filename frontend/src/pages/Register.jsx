import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { register } from "../api.js";
import { getUser } from "../auth.js";

// Making an account is an admin job on this backend, so this page is not for
// everybody. There is no public sign-up.
export default function Register() {
  // One piece of state per box. It is more lines than clever tricks would be,
  // but you can see exactly where every value lives.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Who is looking at this page.
  const user = getUser();

  // These two checks come AFTER the useState lines on purpose. React needs
  // every useState in a component to run on every draw, so never put one
  // behind an if or after a return.
  if (!user) {
    // Nobody is logged in. <Navigate> sends the browser somewhere else.
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    // Logged in, but a teacher or a student. Django would refuse this anyway;
    // sending them away just saves a pointless trip to the server.
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      // The names on the left are what Django expects. Note first_name and
      // last_name: Python uses underscores where JavaScript uses capitals.
      const created = await register({
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        phone: phone,
        role: role,
        password: password,
      });

      setSuccess(
        "Account created for " +
          created.username +
          " as " +
          created.role +
          ". They log in with the phone number, not the username.",
      );

      // Empty the form. The next account needs its own phone number and
      // username, because Django insists both are unique.
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setRole("student");
      setPassword("");
    } catch (problem) {
      setError(problem.message);
    }

    setIsSending(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back
        </Link>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Create an account
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Admins only. Pick the role now, because nobody can promote
            themselves later.
          </p>

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm whitespace-pre-line text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />

            {/* The only box Django does not insist on. */}
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {/* This is what they will type on the login page. */}
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="01711110001"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            {/* Django checks the password itself: too short or too common
                comes back as a "password: ..." line in the red box above. */}
            <input
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="submit"
              disabled={isSending}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSending ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
