import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, Lock, LogIn } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { Button, Field, PasswordInput } from "../components/ui/index.js";
import { setNewPasswordFromEmailLink } from "../api.js";

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
        title="Password updated"
        subtitle="Your new password is ready to use."
      >
        <div className="space-y-5">
          <SuccessMessage>{successMessage}</SuccessMessage>
          <Link to="/login">
            <Button size="lg" className="w-full" Icon={LogIn}>
              Go to login
            </Button>
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
        <Field label="New password" hint="At least 8 characters." required>
          {fieldProps => (
            <PasswordInput
              {...fieldProps}
              Icon={Lock}
              minLength="8"
              autoComplete="new-password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
            />
          )}
        </Field>

        <Field label="Confirm password" required>
          {fieldProps => (
            <PasswordInput
              {...fieldProps}
              Icon={Lock}
              minLength="8"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
            />
          )}
        </Field>

        <ErrorMessage>
          {linkIsIncomplete
            ? "This reset link is missing information. Request a new one from the login page."
            : errorMessage}
        </ErrorMessage>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          Icon={KeyRound}
          disabled={linkIsIncomplete}
          isLoading={isSaving}
          loadingLabel="Updating..."
        >
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
