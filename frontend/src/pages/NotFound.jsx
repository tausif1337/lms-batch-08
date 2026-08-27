import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useAuth } from "../auth.js";
import { Button } from "../components/index.js";

// This route sits outside the sidebar layout, so there is no menu on screen
// to escape with. That is what the button is for. Where it points depends on
// whether there is a session: the dashboard needs one, the login page does
// not, and offering the wrong one only bounces you straight back here.
export default function NotFound() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Compass size={22} />
        </span>

        <h1 className="text-4xl font-semibold text-slate-900">404</h1>

        <p className="mt-2 text-lg text-slate-600">Page not found</p>

        <p className="mt-1 text-sm text-slate-500">
          That address does not belong to any page in this app.
        </p>

        <Link to={isLoggedIn ? "/" : "/login"} className="mt-6 inline-block">
          <Button>{isLoggedIn ? "Back to the dashboard" : "Go to log in"}</Button>
        </Link>
      </div>
    </div>
  );
}
