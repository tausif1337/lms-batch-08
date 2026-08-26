import { Link } from "react-router-dom";

// Shown when the address matches none of the pages in App.jsx.
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-4xl font-semibold text-slate-900">404</h1>
        <p className="mt-2 text-lg text-slate-600">Page not found</p>

        <Link
          to="/"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
