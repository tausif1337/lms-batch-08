import { Link } from "react-router-dom";
import { GraduationCap, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "../auth.js";
import Button from "../components/Button.jsx";

// The place a successful login lands. Deliberately thin — the real pages
// arrive later; this exists so the login has somewhere to go.
export default function Home() {
  const { user, logOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <GraduationCap size={22} className="shrink-0 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Hello, {user?.username ?? "there"}
          </h1>
        </div>

        <p className="mb-6 text-sm text-slate-500">
          You are signed in as {user?.role ?? "..."}.
        </p>

        <div className="flex flex-wrap gap-2">
          {/* Shown to admins only, to match the guard on the route. Hiding it
              is a courtesy; ProtectedRoute and IsAdmin are what enforce it. */}
          {user?.role === "admin" && (
            <Link to="/register">
              <Button>
                <UserPlus size={16} />
                Create an account
              </Button>
            </Link>
          )}

          <Button variant="secondary" onClick={logOut}>
            <LogOut size={16} />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
