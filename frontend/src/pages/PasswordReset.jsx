import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AtSign, Mail, Send } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { Button, Field, TextInput } from "../components/ui/index.js";
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
      footer={
        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" required>
          {fieldProps => (
            <TextInput
              {...fieldProps}
              Icon={AtSign}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          )}
        </Field>

        <SuccessMessage>{successMessage}</SuccessMessage>
        <ErrorMessage>{errorMessage}</ErrorMessage>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          Icon={Send}
          isLoading={isSending}
          loadingLabel="Sending..."
        >
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
