import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button, Input } from "../components/index.js";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Log in to LMS</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Phone number"
              placeholder="01711110001"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" className="mt-4 w-full justify-center">
            Log in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
