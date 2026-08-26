import { Navigate, useNavigate, Link } from "react-router-dom";
import { clearLogin, getUser } from "../auth.js";

export default function Home() {

  const navigate = useNavigate();
  const user = getUser();


  // If nobody is logged in,
  // send them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }


  // Logout
  function handleLogout() {
    clearLogin();
    navigate("/login");
  }


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* First letter of the username, inside a circle */}
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-indigo-600 text-white text-2xl font-semibold flex items-center justify-center">
          {user.username.charAt(0).toUpperCase()}
        </div>


        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {user.username}
        </h1>


        <p className="mt-2 text-sm text-slate-500">
          You are logged in as
          <span className="ml-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 capitalize">
            {user.role}
          </span>
        </p>


        <div className="mt-8 space-y-3">

          {/* Only admins can see this button */}
          {user.role === "admin" && (
            <Link
              to="/register"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Create an account
            </Link>
          )}


          <button
            onClick={handleLogout}
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>

        </div>

      </div>

    </div>
  );
}
