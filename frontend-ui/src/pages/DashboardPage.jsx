import { useEffect, useState } from "react";
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
} from "../api";
import { Alert, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../AuthContext";

const CARDS = [
  {
    key: "teachers",
    label: "Teachers",
    to: "/teachers",
    icon: Users,
    api: teachers,
  },
  {
    key: "students",
    label: "Students",
    to: "/students",
    icon: GraduationCap,
    api: students,
  },
  {
    key: "courses",
    label: "Courses",
    to: "/courses",
    icon: BookOpen,
    api: courses,
  },
  {
    key: "enrollments",
    label: "Enrollments",
    to: "/enrollments",
    icon: ClipboardList,
    api: enrollments,
  },
  {
    key: "lessons",
    label: "Lessons",
    to: "/lessons",
    icon: FileText,
    api: lessons,
  },
  {
    key: "assignments",
    label: "Assignments",
    to: "/assignments",
    icon: ClipboardList,
    api: assignments,
  },
  {
    key: "submissions",
    label: "Submissions",
    to: "/submissions",
    icon: Send,
    api: submissions,
  },
  {
    key: "results",
    label: "Results",
    to: "/results",
    icon: Trophy,
    api: results,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Ask for all eight lists at the same time instead of one after
        // another, so the page appears faster.
        const lists = await Promise.all(CARDS.map((c) => c.api.list()));
        const next = {};
        CARDS.forEach((c, i) => {
          next[c.key] = lists[i].length;
        });
        setCounts(next);
      } catch (err) {
        setError(err.text || "Could not load the dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.username ?? ""}`}
        subtitle="A quick count of everything in the system."
      />

      <Alert kind="error" onClose={() => setError("")}>
        {error}
      </Alert>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, label, to, icon: Icon }) => (
            <Link
              key={key}
              to={to}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {label}
                </span>
                <Icon size={16} className="text-indigo-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {counts[key] ?? 0}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
