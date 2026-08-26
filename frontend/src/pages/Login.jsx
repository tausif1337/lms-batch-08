import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api.js";
import { saveLogin } from "../auth.js";

export default function Login() {
  // useState gives us a value and a function that changes it. Calling that
  // function tells React to draw the page again with the new value.
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // The red message under the heading. Empty means no message.
  const [error, setError] = useState("");

  // True while we are waiting for Django to answer, so the button can say
  // "Logging in..." and stop a second click.
  const [isSending, setIsSending] = useState(false);

  // navigate() moves to another page in code, the way clicking a link does.
  const navigate = useNavigate();

  async function handleSubmit(event) {
    // A form normally reloads the whole page when it is submitted. This stops
    // that, because we want to send the request ourselves.
    event.preventDefault();

    setError("");
    setIsSending(true);

    try {
      const data = await login(phone, password);

      // WATCH OUT: the token is inside data.tokens, not data.access.
      saveLogin(data.tokens.access, {
        username: data.username,
        role: data.role,
      });

      navigate("/");
    } catch (problem) {
      // Anything api.js threw ends up here, already worded for a human.
      setError(problem.message);
    }

    setIsSending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">
          Log in to LMS
        </h1>

        {/* Show the red box only when there is something to say. In JSX,
            "a && b" means "draw b only if a is true". */}
        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm whitespace-pre-line text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Phone number
          </label>
          {/* value and onChange together are what make this box work. React
              shows `phone` in the box, and every keystroke saves the new text
              back into `phone`. Leave onChange out and the box will not type. */}
          <input
            className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            placeholder="01711110001"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
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
            {isSending ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* import.meta.env.DEV is true while you run `npm run dev` and false
            in a real build, so these details never reach a live site. */}
        {import.meta.env.DEV && (
          <p className="mt-5 rounded-md border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            While developing: log in as the admin with 01700000000 and the
            password you gave that account.
          </p>
        )}

        {/* No sign-up link on purpose. Accounts are made by an admin. */}
        <p className="mt-4 text-center text-sm text-slate-500">
          No account? Ask an admin to make you one.
        </p>
      </div>
    </div>
  );
}
