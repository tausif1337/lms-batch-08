import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MailCheck } from "lucide-react";
import { requestPasswordReset } from "../api.js";
import { Alert, Button, Input } from "../components/index.js";

// Step one of two. This page only asks for the email; the link that arrives
// in the inbox lands on /reset-password, which is the other half.
//
// The server answers the same way whether or not the address belongs to an
// account, so this page cannot be used to find out who is registered. That
// is why the message below says "if" instead of "we sent".
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [wasSent, setWasSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSending(true);

    try {
      await requestPasswordReset(email);
      setWasSent(true);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Forgot your password
          </h1>
        </div>

        {wasSent ? (
          <>
            <div className="mb-4 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 py-2 pl-3 pr-3 text-sm text-green-700">
              <MailCheck size={16} className="mt-0.5 shrink-0" />
              <span>
                If an account uses <strong>{email}</strong>, a reset link is on
                its way. The link expires, so use it soon.
              </span>
            </div>

            {/* In development the mail backend prints to the Django console
                instead of sending, so the link is in that terminal. */}
            {import.meta.env.DEV && (
              <p className="mb-4 rounded-md border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                Dev only — email is printed to the Django terminal, not sent.
                Copy the link from there.
              </p>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                setWasSent(false);
                setEmail("");
              }}
              className="w-full justify-center"
            >
              Send to a different address
            </Button>
          </>
        ) : (
          <>
            <Alert onDismiss={() => setError("")}>{error}</Alert>

            <p className="mb-4 text-sm text-slate-500">
              Type the email address on your account and we will send you a
              link to set a new password.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Button
                type="submit"
                disabled={isSending}
                className="mt-4 w-full justify-center disabled:opacity-60"
              >
                {isSending ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
