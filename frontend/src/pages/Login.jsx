import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, LogIn, Phone, Sparkles } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import { ErrorMessage } from "../components/Message.jsx";
import { Button, Field, PasswordInput, TextInput } from "../components/ui/index.js";
import { login } from "../api.js";
import { saveLoggedInUser } from "../auth.js";

const PASSWORD_OF_EVERY_DEMO_ACCOUNT = "Demo@12345";

const DEMO_ACCOUNTS = [
  { role: "Admin", phone: "01700000010" },
  { role: "Teacher", phone: "01700000011" },
  { role: "Student", phone: "01700000012" },
];

function DemoAccountList({ onPick }) {
  return (
    <div className="mt-7 rounded-xl border border-dashed border-accent-300 bg-accent-50 p-3 dark:border-accent-700/60 dark:bg-accent-900/20">
      <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-accent-800 dark:text-accent-300">
        <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        Demo accounts (dev only)
      </p>

      <div className="mt-2 space-y-0.5">
        {DEMO_ACCOUNTS.map(account => (
          <button
            key={account.phone}
            type="button"
            onClick={() => onPick(account.phone)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-accent-900 transition hover:bg-accent-100 dark:text-accent-200 dark:hover:bg-accent-900/40"
          >
            <span className="font-semibold">{account.role}</span>
            <span className="font-mono">{account.phone}</span>
          </button>
        ))}
      </div>

      <p className="mt-1.5 px-2 text-xs text-accent-700 dark:text-accent-400">
        Password <span className="font-mono">{PASSWORD_OF_EVERY_DEMO_ACCOUNT}</span> — click a row
        to fill.
      </p>
    </div>
  );
}

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const goToPage = useNavigate();

  function fillInDemoAccount(demoPhone) {
    setPhone(demoPhone);
    setPassword(PASSWORD_OF_EVERY_DEMO_ACCOUNT);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSigningIn(true);

    try {
      const answer = await login(phone.trim(), password);

      saveLoggedInUser(answer.tokens, {
        user_id: answer.user_id,
        username: answer.username,
        role: answer.role,
      });

      goToPage("/dashboard", { replace: true });
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <AuthCard
      Icon={LogIn}
      title="Welcome back"
      subtitle="Sign in with the phone number on your account."
      footer={
        <p className="text-center text-xs text-content-subtle">
          Accounts are created by an administrator.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Phone number" required>
          {fieldProps => (
            <TextInput
              {...fieldProps}
              Icon={Phone}
              type="tel"
              autoComplete="username"
              placeholder="01700000000"
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          )}
        </Field>

        <Field label="Password" required>
          {fieldProps => (
            <PasswordInput
              {...fieldProps}
              Icon={KeyRound}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="rounded text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>

        <ErrorMessage>{errorMessage}</ErrorMessage>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          Icon={LogIn}
          isLoading={isSigningIn}
          loadingLabel="Signing in..."
        >
          Sign in
        </Button>
      </form>

      {import.meta.env.DEV && <DemoAccountList onPick={fillInDemoAccount} />}
    </AuthCard>
  );
}
