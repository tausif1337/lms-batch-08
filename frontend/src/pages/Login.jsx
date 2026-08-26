import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../api.js";
import { saveLogin } from "../auth.js";


// Every input on this page looks the same,
// so the classes live here instead of being repeated
const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";


export default function Login() {

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      // Send phone and password to Django
      const data = await login(phone, password);

      // Save JWT and user information
      saveLogin(data.tokens.access, {
        username: data.username,
        role: data.role,
      });

      // Go to Home page
      navigate("/");

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-slate-900">Login</h1>

        <p className="mt-1 mb-6 text-sm text-slate-500">
          Sign in to your LMS account
        </p>


        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}
