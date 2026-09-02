import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AtSign, LoaderCircle, Mail, Send } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { requestPasswordResetEmail } from "../api.js";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const answer = await requestPasswordResetEmail(email);
      setSuccessMessage(answer.detail);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AuthCard
      Icon={Mail}
      title="Forgot password"
      subtitle="Enter your email and we will send a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium">
          Email
          <span className="relative mt-1 block">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </span>
        </label>

        <SuccessMessage>{successMessage}</SuccessMessage>
        <ErrorMessage>{errorMessage}</ErrorMessage>

        <button
          disabled={isSending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send reset link
            </>
          )}
        </button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </form>
    </AuthCard>
  );
}
