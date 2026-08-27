import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { confirmPasswordReset } from "../api.js";
import { Alert, Button, Input } from "../components/index.js";

// Step two of two. The emailed link carries the two halves of the proof in
// the query string: ?uid=...&token=... . They are handed straight back to the
// server, which is the only thing that can say whether they are still good —
// checking them here would mean nothing.
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // A link that arrived truncated, or an address typed by hand, has nothing
  // to send. Say so rather than posting a request that is certain to fail.
  const linkIsComplete = Boolean(uid && token);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Resetting the password retires the old sessions, so there is nothing
      // to do here but send them to the login page with the good news.
      navigate("/login", {
        replace: true,
        state: { notice: "Password reset. Log in with your new password." },
      });
    } catch (problem) {
      setError(problem.message);
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Set a new password
          </h1>
        </div>

        {linkIsComplete ? (
          <>
            <Alert onDismiss={() => setError("")}>{error}</Alert>

            <form onSubmit={handleSubmit}>
              <Input
                label="New password"
                type="password"
                className="block"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <Input
                label="Confirm new password"
                type="password"
                className="mt-4 block"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <p className="mt-2 text-xs text-slate-500">
                Any other device still signed in as you is signed out.
              </p>

              <Button
                type="submit"
                disabled={isSaving}
                className="mt-4 w-full justify-center disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Set new password"}
              </Button>
            </form>
          </>
        ) : (
          <Alert>
            {
              "This reset link is incomplete.\nOpen the link from the email exactly as it was sent, or ask for a new one."
            }
          </Alert>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Ask for a new link
          </Link>
          <span className="px-2 text-slate-300">|</span>
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
