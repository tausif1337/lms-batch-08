import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">

      <h1 className="text-7xl font-bold text-indigo-600">404</h1>

      <p className="mt-3 text-slate-600">Page not found.</p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Go Home
      </Link>
    </div>
  );
}
