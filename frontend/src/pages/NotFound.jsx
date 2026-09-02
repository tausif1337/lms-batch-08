import { Link } from "react-router-dom";
import { LayoutDashboard, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center">

      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <SearchX className="h-8 w-8" />
      </div>

      <h1 className="text-7xl font-bold text-indigo-600">404</h1>

      <p className="mt-3 text-slate-600">Page not found.</p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        <LayoutDashboard className="h-4 w-4" />
        Go to dashboard
      </Link>
    </div>
  );
}
