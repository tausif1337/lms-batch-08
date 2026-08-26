import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearLogin, getUser } from "../auth.js";

// Where you land after logging in. Deliberately thin: it exists so the login
// has somewhere to go.
export default function Home() {
  const navigate = useNavigate();
  const user = getUser();

  // Not logged in, so there is nothing to show. Back to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearLogin();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Hello, {user.username}
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          You are signed in as {user.role}.
        </p>

        <div className="flex gap-2">
          {/* Only an admin can make accounts, so only an admin sees the
              button. Hiding it is a courtesy: Django refuses the request
              either way, and that is what actually keeps it safe. */}
          {user.role === "admin" && (
            <Link
              to="/register"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create an account
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
