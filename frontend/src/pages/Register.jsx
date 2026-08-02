// ---------------------------------------------------------------------------
// THE REGISTER PAGE — THE SIGN-UP SCREEN.
//
// This is the same shape as Login.jsx, with more boxes to fill in.
//
// No account is really created. There is no server here and nowhere to keep
// an account. Pressing the button takes you to the dashboard, whatever you
// typed in the boxes.
//
// The boxes and the button come from src/components, the same ones every
// other page uses.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button, Input } from "../components/index.js";

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
                {/* Each <Input> is a <label> wrapped around a box, so clicking
                    the words puts the cursor in the box. */}
                <Input
                  label="First name"
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
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                label="Phone"
                placeholder="01711110001"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />

              {/* type="password" hides the letters as you type them. */}
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {/* className here is added on top of the button's own blue look, so
                this one is as wide as the card. */}
            <Button type="submit" className="mt-4 w-full justify-center">
              Create account
            </Button>
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
