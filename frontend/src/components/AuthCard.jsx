import { BookOpen, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle.jsx";

const SELLING_POINTS = [
  { Icon: GraduationCap, text: "Courses, lessons and assignments in one workspace" },
  { Icon: ShieldCheck, text: "Role-based access enforced by the backend, not the UI" },
  { Icon: Sparkles, text: "Grade submissions and publish results in a few clicks" },
];

/** Brand panel shown beside every auth form on large screens. */
function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-rail p-10 lg:flex lg:flex-col lg:justify-between">
      {/* Two soft brand-coloured glows keep the dark panel from reading flat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl"
      />

      <div className="relative flex items-center gap-2.5 text-rail-fg">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-brand-950">
          <BookOpen aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">LMS</span>
      </div>

      <div className="relative">
        <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-rail-fg">
          Everything your course needs, in one place.
        </h2>

        <ul className="mt-8 space-y-4">
          {SELLING_POINTS.map(point => (
            <li key={point.text} className="flex items-start gap-3 text-sm text-rail-fg-muted">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                <point.Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-rail-fg-muted">
        Learning management system — teachers, students and results.
      </p>
    </div>
  );
}

export default function AuthCard({ Icon, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <BrandPanel />

      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <ThemeToggle className="absolute right-5 top-5" />

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-on-soft">
              <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-content">{title}</h1>
            <p className="mt-1.5 text-sm text-content-muted">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-7">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
