import { useState } from "react";
import { AtSign, IdCard, KeyRound, Phone, ShieldCheck, User, UserPlus } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  PasswordInput,
  SelectInput,
  TextInput,
} from "../components/ui/index.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import { register } from "../api.js";

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
];

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
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="LMS management"
          title="Create account"
          description="Add a new student, teacher or admin. They sign in with the phone number you set here."
        />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader
              Icon={UserPlus}
              title="Account details"
              description="All fields marked with * are required."
            />

            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {FORM_BOXES.map(box => (
                  <Field key={box.name} label={box.label} required={box.isRequired}>
                    {fieldProps => (
                      <TextInput
                        {...fieldProps}
                        Icon={box.Icon}
                        type={box.type}
                        value={form[box.name]}
                        onChange={event => changeOneBox(box.name, event.target.value)}
                      />
                    )}
                  </Field>
                ))}

                <Field label="Role" required hint="Decides what this person can see and change.">
                  {fieldProps => (
                    <SelectInput
                      {...fieldProps}
                      Icon={ShieldCheck}
                      value={form.role}
                      onChange={event => changeOneBox("role", event.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </SelectInput>
                  )}
                </Field>

                <Field label="Password" required hint="At least 8 characters.">
                  {fieldProps => (
                    <PasswordInput
                      {...fieldProps}
                      Icon={KeyRound}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={event => changeOneBox("password", event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <ErrorMessage onDismiss={() => setErrorMessage("")}>{errorMessage}</ErrorMessage>
              <SuccessMessage onDismiss={() => setSuccessMessage("")}>
                {successMessage}
              </SuccessMessage>
            </CardBody>

            <CardFooter className="justify-end">
              <Button
                type="submit"
                Icon={UserPlus}
                isLoading={isCreating}
                loadingLabel="Creating..."
              >
                Create account
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
