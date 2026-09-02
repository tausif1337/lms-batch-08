import { useState } from "react";
import {
  AtSign,
  IdCard,
  KeyRound,
  LoaderCircle,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import { register } from "../api.js";

const INPUT_STYLE =
  "w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const ICON_INSIDE_INPUT_STYLE =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  role: "student",
  password: "",
};

const FORM_BOXES = [
  { name: "first_name", label: "First name", type: "text", isRequired: true, Icon: User },
  { name: "last_name", label: "Last name", type: "text", isRequired: false, Icon: User },
  { name: "username", label: "Username", type: "text", isRequired: true, Icon: IdCard },
  { name: "email", label: "Email", type: "email", isRequired: true, Icon: AtSign },
  { name: "phone", label: "Phone number", type: "tel", isRequired: true, Icon: Phone },
  { name: "password", label: "Password", type: "password", isRequired: true, Icon: KeyRound },
];

function LabelledBox({ label, Icon, children }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <span className="relative mt-1 block">
        <Icon className={ICON_INSIDE_INPUT_STYLE} />
        {children}
      </span>
    </label>
  );
}

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function changeOneBox(name, newValue) {
    setForm(oldForm => ({ ...oldForm, [name]: newValue }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsCreating(true);

    try {
      const newAccount = await register(form);
      setSuccessMessage(`Account created for ${newAccount.username} as ${newAccount.role}.`);
      setForm(EMPTY_FORM);
    } catch (failure) {
      setErrorMessage(failure.message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Layout title="Create account">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="text-sm text-slate-500">LMS management</p>
          <h2 className="text-2xl font-bold">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a new student, teacher or admin. They sign in with the phone number you set here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {FORM_BOXES.map(box => (
              <LabelledBox key={box.name} label={box.label} Icon={box.Icon}>
                <input
                  required={box.isRequired}
                  type={box.type}
                  value={form[box.name]}
                  onChange={event => changeOneBox(box.name, event.target.value)}
                  className={INPUT_STYLE}
                />
              </LabelledBox>
            ))}

            <LabelledBox label="Role" Icon={ShieldCheck}>
              <select
                value={form.role}
                onChange={event => changeOneBox("role", event.target.value)}
                className={INPUT_STYLE}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </LabelledBox>
          </div>

          <ErrorMessage className="mt-5">{errorMessage}</ErrorMessage>
          <SuccessMessage className="mt-5">{successMessage}</SuccessMessage>

          <button
            type="submit"
            disabled={isCreating}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
