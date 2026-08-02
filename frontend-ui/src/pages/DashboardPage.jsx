import { Link } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import {
  assignments,
  courses,
  enrollments,
  lessons,
  results,
  students,
  submissions,
  teachers,
} from "../data";
import { PageHeader } from "../components/ui";

// Each tile counts one of the static lists in data.js.
const CARDS = [
  { key: "teachers", label: "Teachers", to: "/teachers", icon: Users, rows: teachers },
  {
    key: "students",
    label: "Students",
    to: "/students",
    icon: GraduationCap,
    rows: students,
  },
  { key: "courses", label: "Courses", to: "/courses", icon: BookOpen, rows: courses },
  {
    key: "enrollments",
    label: "Enrollments",
    to: "/enrollments",
    icon: ClipboardList,
    rows: enrollments,
  },
  { key: "lessons", label: "Lessons", to: "/lessons", icon: FileText, rows: lessons },
  {
    key: "assignments",
    label: "Assignments",
    to: "/assignments",
    icon: ClipboardList,
    rows: assignments,
  },
  {
    key: "submissions",
    label: "Submissions",
    to: "/submissions",
    icon: Send,
    rows: submissions,
  },
  { key: "results", label: "Results", to: "/results", icon: Trophy, rows: results },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Welcome back, admin"
        subtitle="A quick count of everything in the system."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ key, label, to, icon: Icon, rows }) => (
          <Link
            key={key}
            to={to}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <Icon size={16} className="text-indigo-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {rows.length}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
