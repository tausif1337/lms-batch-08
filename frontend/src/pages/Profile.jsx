import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Save } from "lucide-react";
import { changePassword, fetchProfile, updateProfile } from "../api.js";
import { useAuth } from "../auth.js";
import { roleLabel } from "../permissions.js";
import { Alert, Button, Input, PageHeader } from "../components/index.js";

// Everyone gets this page, whatever their role. Two separate forms, because
// they are two different jobs with different rules: your details save on
// their own, and a password change needs the old password and signs you out.
export default function Profile() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [detailsError, setDetailsError] = useState("");
  const [detailsNotice, setDetailsNotice] = useState("");
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Read the account from the server rather than from the saved session: the
  // session only keeps id, username and role.
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProfile();
        setUsername(data.user.username ?? "");
        setRole(data.user.role ?? "");
        setFirstName(data.user.first_name ?? "");
        setLastName(data.user.last_name ?? "");
        setEmail(data.user.email ?? "");
        setPhone(data.user.phone ?? "");
        setDetailsError("");
      } catch (problem) {
        setDetailsError(problem.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  async function handleSaveDetails(event) {
    event.preventDefault();
    setIsSavingDetails(true);

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      });
      setDetailsError("");
      setDetailsNotice("Your details have been saved.");
    } catch (problem) {
      setDetailsError(problem.message);
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setIsSavingPassword(true);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // The old token stays technically valid until it expires, so the honest
      // thing is to end the session here and make them sign in with the new
      // password.
      logOut();
      navigate("/login", { replace: true });
    } catch (problem) {
      setPasswordError(problem.message);
      setIsSavingPassword(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Your profile"
        subtitle="Your own details and password. Nobody else's."
      />

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSaveDetails}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Your details
          </h2>

          <Alert>{detailsError}</Alert>
          <Alert variant="success">{detailsNotice}</Alert>

          {isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span>
                  Signed in as <strong>{username}</strong>
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                  {roleLabel(role)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                label="Email"
                type="email"
                className="mt-4 block"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                label="Phone"
                className="mt-4 block"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />

              <p className="mt-2 text-xs text-slate-500">
                Your phone number is what you log in with. Change it and the
                new one is what you type next time.
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Your username and your role are set by an admin, so they are
                not editable here.
              </p>

              <div className="mt-4">
                <Button type="submit" disabled={isSavingDetails}>
                  <Save size={14} />
                  {isSavingDetails ? "Saving..." : "Save details"}
                </Button>
              </div>
            </>
          )}
        </form>

        <form
          onSubmit={handleChangePassword}
          className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Change password
          </h2>

          <Alert>{passwordError}</Alert>

          <Input
            label="Current password"
            type="password"
            className="block"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />

          <Input
            label="New password"
            type="password"
            className="mt-4 block"
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
            You will be signed out and asked to log in with the new password.
          </p>

          <div className="mt-4">
            <Button type="submit" disabled={isSavingPassword}>
              <KeyRound size={14} />
              {isSavingPassword ? "Changing..." : "Change password"}
            </Button>
          </div>
        </form>
      </div>

      {user?.role === "admin" && (
        <p className="mt-6 max-w-4xl text-sm text-slate-500">
          Changing somebody else&rsquo;s details, or anybody&rsquo;s role, is
          done from the Django admin site.
        </p>
      )}
    </div>
  );
}
