import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { register } from "../api.js";
import { getUser } from "../auth.js";


// Every input on this page looks the same,
// so the classes live here instead of being repeated
const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";


export default function Register() {

  // Form values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);

  // Get logged in user
  const user = getUser();


  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }


  // Not an admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);


    try {

      // Send form data to Django
      const data = await register({

        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        phone: phone,
        role: role,
        password: password,

      });


      // Show success message
      setSuccess(
        `Account created for ${data.username}`
      );


      // Clear the form
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setRole("student");
      setPassword("");

    } catch (error) {

      // Show error
      setError(error.message);

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="min-h-screen bg-slate-100 p-4 py-10">

      <div className="mx-auto w-full max-w-lg">

        <Link
          to="/"
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
        >
          &larr; Back to Home
        </Link>


        <div className="mt-4 bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Add a new student, teacher or admin
          </p>


          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}


          {success && (
            <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First and last name sit side by side on wider screens */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <input
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />


              <input
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />

            </div>


            <input
              placeholder="Username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClass}
            />


            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />


            <input
              placeholder="Phone number"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
            />


            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={inputClass}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>


            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
