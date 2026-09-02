import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LoaderCircle, Save, ShieldCheck, UserRound } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../api.js";
import { forgetLoggedInUser, getLoggedInUser, updateLoggedInUser } from "../auth.js";

const INPUT_STYLE =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const DETAIL_BOXES = [
  { name: "first_name", label: "First name", type: "text", isRequired: true },
  { name: "last_name", label: "Last name", type: "text", isRequired: false },
  { name: "email", label: "Email", type: "email", isRequired: true },
  { name: "phone", label: "Phone", type: "text", isRequired: true },
];

const PASSWORD_BOXES = [
  { name: "current_password", label: "Current password" },
  { name: "new_password", label: "New password" },
  { name: "confirm_password", label: "Confirm new password" },
];

const EMPTY_PASSWORD_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function detailsOf(user) {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };
}

function PersonalDetailsForm({ details, role, onChangeOneBox, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <UserRound className="h-5 w-5 text-indigo-600" />
        Personal details
      </h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">
        Update the information attached to your account.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {DETAIL_BOXES.map(box => (
          <label key={box.name} className="text-sm font-medium">
            {box.label}
            <input
              required={box.isRequired}
              type={box.type}
              value={details[box.name]}
              onChange={event => onChangeOneBox(box.name, event.target.value)}
              className={INPUT_STYLE}
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
        <ShieldCheck className="h-4 w-4 text-slate-500" />
        Role: <strong className="capitalize">{role}</strong>
      </div>

      <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
        <Save className="h-4 w-4" />
        Save profile
      </button>
    </form>
  );
}

function ChangePasswordForm({ passwords, onChangeOneBox, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <KeyRound className="h-5 w-5 text-indigo-600" />
        Change password
      </h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">
        You will need to log in again after changing it.
      </p>

      {PASSWORD_BOXES.map(box => (
        <label key={box.name} className="mb-4 block text-sm font-medium">
          {box.label}
          <input
            required
            type="password"
            value={passwords[box.name]}
            onChange={event => onChangeOneBox(box.name, event.target.value)}
            className={INPUT_STYLE}
          />
        </label>
      ))}

      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">
        <KeyRound className="h-4 w-4" />
        Change password
      </button>
    </form>
  );
}

export default function Profile() {
  const savedUser = getLoggedInUser();
  const goToPage = useNavigate();

  const [details, setDetails] = useState(detailsOf(savedUser));
  const [passwords, setPasswords] = useState(EMPTY_PASSWORD_FORM);
  const [role, setRole] = useState(savedUser?.role || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(answer => {
        setDetails(detailsOf(answer.user));
        setRole(answer.user.role);
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

    try {
      const answer = await updateMyProfile(details);
      updateLoggedInUser(answer.user);
      setRole(answer.user.role);
      setSuccessMessage(answer.message);
    } catch (failure) {
      setErrorMessage(failure.message);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const answer = await changeMyPassword(passwords);
      forgetLoggedInUser();
      setSuccessMessage(answer.detail || "Password changed. Please log in again.");
      setTimeout(() => goToPage("/login", { replace: true }), 1000);
    } catch (failure) {
      setErrorMessage(failure.message);
    }
  }

  return (
    <Layout title="Profile">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        ) : (
          <>
            <PersonalDetailsForm
              details={details}
              role={role}
              onChangeOneBox={changeOneDetail}
              onSubmit={handleSaveDetails}
            />
            <ChangePasswordForm
              passwords={passwords}
              onChangeOneBox={changeOnePassword}
              onSubmit={handleChangePassword}
            />
          </>
        )}
      </div>

      {(errorMessage || successMessage) && (
        <div className="mx-auto mt-5 max-w-5xl">
          <ErrorMessage>{errorMessage}</ErrorMessage>
          <SuccessMessage>{successMessage}</SuccessMessage>
        </div>
      )}
    </Layout>
  );
}
