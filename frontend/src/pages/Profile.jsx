import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, KeyRound, Phone, Save, ShieldCheck, User, UserRound } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  PageHeader,
  PasswordInput,
  Skeleton,
  TextInput,
} from "../components/ui/index.js";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../api.js";
import { forgetLoggedInUser, getLoggedInUser, updateLoggedInUser } from "../auth.js";

const DETAIL_BOXES = [
  { name: "first_name", label: "First name", type: "text", isRequired: true, Icon: User },
  { name: "last_name", label: "Last name", type: "text", isRequired: false, Icon: User },
  { name: "email", label: "Email", type: "email", isRequired: true, Icon: AtSign },
  { name: "phone", label: "Phone", type: "tel", isRequired: true, Icon: Phone },
];

const PASSWORD_BOXES = [
  { name: "current_password", label: "Current password", autoComplete: "current-password" },
  { name: "new_password", label: "New password", autoComplete: "new-password" },
  { name: "confirm_password", label: "Confirm new password", autoComplete: "new-password" },
];

const EMPTY_PASSWORD_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const TONE_FOR_ROLE = { admin: "danger", teacher: "info", student: "brand" };

function detailsOf(user) {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };
}

function IdentityCard({ details, role, username }) {
  const fullName = [details.first_name, details.last_name].filter(Boolean).join(" ");

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-fg">
          {(fullName || username || "?").charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-content">{fullName || username}</p>
          <p className="truncate text-sm text-content-muted">{details.email}</p>
        </div>

        <Badge tone={TONE_FOR_ROLE[role] || "neutral"}>
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="capitalize">{role}</span>
        </Badge>
      </div>
    </Card>
  );
}

function PersonalDetailsForm({ details, onChangeOneBox, onSubmit, isSaving }) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader
          Icon={UserRound}
          title="Personal details"
          description="Update the information attached to your account."
        />

        <CardBody>
          <div className="grid gap-5 sm:grid-cols-2">
            {DETAIL_BOXES.map(box => (
              <Field key={box.name} label={box.label} required={box.isRequired}>
                {fieldProps => (
                  <TextInput
                    {...fieldProps}
                    Icon={box.Icon}
                    type={box.type}
                    value={details[box.name]}
                    onChange={event => onChangeOneBox(box.name, event.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
        </CardBody>

        <CardFooter className="justify-end">
          <Button type="submit" Icon={Save} isLoading={isSaving} loadingLabel="Saving...">
            Save profile
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ChangePasswordForm({ passwords, onChangeOneBox, onSubmit, isSaving }) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader
          Icon={KeyRound}
          title="Change password"
          description="You will be logged out and asked to sign in again."
        />

        <CardBody className="space-y-5">
          {PASSWORD_BOXES.map(box => (
            <Field key={box.name} label={box.label} required>
              {fieldProps => (
                <PasswordInput
                  {...fieldProps}
                  Icon={KeyRound}
                  autoComplete={box.autoComplete}
                  value={passwords[box.name]}
                  onChange={event => onChangeOneBox(box.name, event.target.value)}
                />
              )}
            </Field>
          ))}
        </CardBody>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            variant="secondary"
            Icon={KeyRound}
            isLoading={isSaving}
            loadingLabel="Updating..."
          >
            Change password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function LoadingProfile() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </Card>
  );
}

export default function Profile() {
  const savedUser = getLoggedInUser();
  const goToPage = useNavigate();

  const [details, setDetails] = useState(detailsOf(savedUser));
  const [passwords, setPasswords] = useState(EMPTY_PASSWORD_FORM);
  const [role, setRole] = useState(savedUser?.role || "");
  const [username, setUsername] = useState(savedUser?.username || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(answer => {
        setDetails(detailsOf(answer.user));
        setRole(answer.user.role);
        setUsername(answer.user.username);
        updateLoggedInUser(answer.user);
      })
      .catch(failure => setErrorMessage(failure.message))
      .finally(() => setIsLoading(false));
  }, []);

  function changeOneDetail(name, newValue) {
    setDetails(oldDetails => ({ ...oldDetails, [name]: newValue }));
  }

  function changeOnePassword(name, newValue) {
    setPasswords(oldPasswords => ({ ...oldPasswords, [name]: newValue }));
  }

  async function handleSaveDetails(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingDetails(true);

    try {
      const answer = await updateMyProfile(details);
      updateLoggedInUser(answer.user);
      setRole(answer.user.role);
      setSuccessMessage(answer.message);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingPassword(true);

    try {
      const answer = await changeMyPassword(passwords);
      forgetLoggedInUser();
      setSuccessMessage(answer.detail || "Password changed. Please log in again.");
      setTimeout(() => goToPage("/login", { replace: true }), 1200);
    } catch (failure) {
      setErrorMessage(failure.message);
      setIsSavingPassword(false);
    }
  }

  return (
    <Layout title="Profile">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Your account"
          title="Profile"
          description="Your details and sign-in password."
        />

        {(errorMessage || successMessage) && (
          <div className="mb-6 space-y-3">
            <ErrorMessage onDismiss={() => setErrorMessage("")}>{errorMessage}</ErrorMessage>
            <SuccessMessage onDismiss={() => setSuccessMessage("")}>
              {successMessage}
            </SuccessMessage>
          </div>
        )}

        {isLoading ? (
          <LoadingProfile />
        ) : (
          <>
            <IdentityCard details={details} role={role} username={username} />

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <PersonalDetailsForm
                details={details}
                onChangeOneBox={changeOneDetail}
                onSubmit={handleSaveDetails}
                isSaving={isSavingDetails}
              />
              <ChangePasswordForm
                passwords={passwords}
                onChangeOneBox={changeOnePassword}
                onSubmit={handleChangePassword}
                isSaving={isSavingPassword}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
