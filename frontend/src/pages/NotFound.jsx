import { Link } from "react-router-dom";
import { LayoutDashboard, SearchX } from "lucide-react";
import { Button, ThemeToggle } from "../components/ui/index.js";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center">
      <ThemeToggle className="absolute right-5 top-5" />

      <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-on-soft">
        <SearchX aria-hidden="true" className="h-8 w-8" />
      </span>

      <p className="text-6xl font-bold tracking-tight text-content sm:text-7xl">404</p>
      <h1 className="mt-3 text-xl font-semibold text-content">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-content-muted">
        The page you asked for does not exist, or your role does not have access to it.
      </p>

      <Link to="/" className="mt-8">
        <Button size="lg" Icon={LayoutDashboard}>
          Go to dashboard
        </Button>
      </Link>
    </div>
  );
}
