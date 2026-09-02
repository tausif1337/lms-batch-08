import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, LoaderCircle, Lock, LogIn } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { setNewPasswordFromEmailLink } from "../api.js";

const INPUT_STYLE =
  "w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const ICON_INSIDE_INPUT_STYLE =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

function PasswordBox({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <span className="relative mt-1 block">
        <Lock className={ICON_INSIDE_INPUT_STYLE} />
        <input
          required
          minLength="8"
          type="password"
          value={value}
          onChange={event => onChange(event.target.value)}
          className={INPUT_STYLE}
        />
      </span>
    </label>
  );
}

export default function ResetPassword() {
  const [addressBarValues] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const userId = addressBarValues.get("uid");
  const resetToken = addressBarValues.get("token");
  const linkIsIncomplete = !userId || !resetToken;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const answer = await setNewPasswordFromEmailLink({
        uid: userId,
        token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMessage(answer.detail);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (successMessage) {
    return (
      <AuthCard
        Icon={KeyRound}
        title="Set a new password"
        subtitle="Choose a new password for your account."
      >
        <div className="space-y-4">
          <SuccessMessage>{successMessage}</SuccessMessage>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-800"
          >
            <LogIn className="h-4 w-4" />
            Go to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      Icon={KeyRound}
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordBox label="New password" value={newPassword} onChange={setNewPassword} />
        <PasswordBox label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} />

        <ErrorMessage>{errorMessage}</ErrorMessage>

        <button
          disabled={isSaving || linkIsIncomplete}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Reset password
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
