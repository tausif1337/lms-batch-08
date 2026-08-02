// ---------------------------------------------------------------------------
// THE LOG IN PAGE.
//
// There is no real log in here. There are no accounts and no password
// checking. Nothing you type is sent anywhere and nothing is compared against
// anything. Typing anything and pressing the button takes you to the
// dashboard, so the screen can be looked at.
//
// The page has three parts, in this order:
//   1. Remember things  — useState, for the form boxes
//   2. Do things        — the small function the button calls
//   3. Show things      — the HTML that ends up on the screen
//
// The boxes and the button come from src/components, the same ones every
// other page uses.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button, Input } from "../components/index.js";

export default function Login() {
  // =========================================================================
  // 1. REMEMBER THINGS
  // =========================================================================
  // useState gives you two things:
  //   phone     -> what is in the box right now
  //   setPhone  -> the function you call to change it
  // The value in useState("") is what it starts as: an empty box.
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // useNavigate gives you a function that moves to another page.
  const navigate = useNavigate();

  // =========================================================================
  // 2. DO THINGS
  // =========================================================================

  // This runs when the form is submitted.
  // event.preventDefault() stops the browser reloading the whole page, which
  // is what an HTML form normally does when you press its button.
  // Then we move to the dashboard. No checking happens.
  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
  }

  // =========================================================================
  // 3. SHOW THINGS
  // =========================================================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {/* ---- the logo and the title ---- */}
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Log in to LMS</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* space-y-4 puts a gap between the two boxes below. */}
          <div className="space-y-4">
            {/* Each <Input> is a <label> wrapped around a box, so clicking the
                words puts the cursor in the box. */}
            <Input
              label="Phone number"
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
            Log in
          </Button>
        </form>

        {/* A <Link> moves to another page without reloading the browser. */}
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
