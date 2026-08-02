// ---------------------------------------------------------------------------
// THE REGISTER PAGE — THE SIGN-UP SCREEN.
//
// This is the same shape as Login.jsx, with more boxes to fill in.
//
// No account is really created. There is no server here and nowhere to keep
// an account. Pressing the button takes you to the dashboard, whatever you
// typed in the boxes.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

// These are just long strings of Tailwind classes, pulled out so the HTML
// below stays readable. They are plain text, nothing clever.
const blueButton =
  "inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700";
const inputBox =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const labelText = "mb-1 block text-sm font-medium text-slate-700";

export default function Register() {
  // useState gives you two things:
  //   firstName     -> what is in the box right now
  //   setFirstName  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  // There is one of these lines for every box on the form.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // useNavigate gives us a function that moves to another address.
  const navigate = useNavigate();

  // This runs when the form is submitted.
  // event.preventDefault() stops the browser reloading the whole page, which
  // is what an HTML form normally does when you press its button.
  // Nothing is checked and nothing is created. We move to the dashboard.
  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* ---- the logo above the card ---- */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <GraduationCap size={26} className="text-indigo-600" />
          <span className="text-xl font-semibold text-slate-900">LMS</span>
        </div>

        {/* ---- the white card holding the form ---- */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-lg font-semibold text-slate-900">
            Create an account
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* First name and last name share one row, two boxes wide. */}
              <div className="grid grid-cols-2 gap-3">
                {/* Each box is a <label> wrapped around an <input>, so
                    clicking the words puts the cursor in the box. */}
                <label>
                  <span className={labelText}>First name</span>
                  <input
                    className={inputBox}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>

                <label>
                  <span className={labelText}>Last name</span>
                  <input
                    className={inputBox}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>
              </div>

              <label>
                <span className={labelText}>Username</span>
                <input
                  className={inputBox}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>

              <label>
                <span className={labelText}>Email</span>
                <input
                  className={inputBox}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label>
                <span className={labelText}>Phone</span>
                <input
                  className={inputBox}
                  placeholder="01711110001"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>

              {/* type="password" hides the letters as you type them. */}
              <label>
                <span className={labelText}>Password</span>
                <input
                  className={inputBox}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            </div>

            <button
              type="submit"
              className={blueButton + " mt-4 w-full justify-center"}
            >
              Create account
            </button>
          </form>
        </div>

        {/* <Link> is a link that swaps the page without reloading it. */}
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
