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
import { useAuth } from "../auth.js";
import {
  assignmentsApi,
  coursesApi,
  enrollmentsApi,
  lessonsApi,
  resultsApi,
  studentsApi,
  submissionsApi,
  teachersApi,
} from "../api.js";
import { Alert, PageHeader } from "../components/index.js";

// One tile per resource. `api` is the module from api.js the count comes from.
const tiles = [
  {
    address: "/teachers",
    text: "Teachers",
    api: teachersApi,
    icon: <Users size={16} className="text-indigo-500" />,
  },
  {
    address: "/students",
    text: "Students",
    api: studentsApi,
    icon: <GraduationCap size={16} className="text-indigo-500" />,
  },
  {
    address: "/courses",
    text: "Courses",
    api: coursesApi,
    icon: <BookOpen size={16} className="text-indigo-500" />,
  },
  {
    address: "/enrollments",
    text: "Enrollments",
    api: enrollmentsApi,
    icon: <ClipboardList size={16} className="text-indigo-500" />,
  },
  {
    address: "/lessons",
    text: "Lessons",
    api: lessonsApi,
    icon: <FileText size={16} className="text-indigo-500" />,
  },
  {
    address: "/assignments",
    text: "Assignments",
    api: assignmentsApi,
    icon: <ClipboardList size={16} className="text-indigo-500" />,
  },
  {
    address: "/submissions",
    text: "Submissions",
    api: submissionsApi,
    icon: <Send size={16} className="text-indigo-500" />,
  },
  {
    address: "/results",
    text: "Results",
    api: resultsApi,
    icon: <Trophy size={16} className="text-indigo-500" />,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // There is no counts endpoint, so every list is fetched and measured.
  useEffect(() => {
    async function load() {
      try {
        const lists = await Promise.all(tiles.map((tile) => tile.api.list()));

        const nextCounts = {};
        tiles.forEach((tile, index) => {
          nextCounts[tile.text] = lists[index].length;
        });

        setCounts(nextCounts);
        setError("");
      } catch (problem) {
        setError(problem.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.username ?? "there"}`}
        subtitle="A quick count of everything in the system."
      />

      <Alert
        className="ml-auto w-fit max-w-md"
        onDismiss={() => setError("")}
      >
        {error}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.address}
            to={tile.address}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {tile.text}
              </span>
              {tile.icon}
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {isLoading ? "—" : (counts[tile.text] ?? 0)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
