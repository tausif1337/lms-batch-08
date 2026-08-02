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
} from "../data.js";
import { PageHeader } from "../components/index.js";

const tiles = [
  {
    address: "/teachers",
    text: "Teachers",
    count: teachers.length,
    icon: <Users size={16} className="text-indigo-500" />,
  },
  {
    address: "/students",
    text: "Students",
    count: students.length,
    icon: <GraduationCap size={16} className="text-indigo-500" />,
  },
  {
    address: "/courses",
    text: "Courses",
    count: courses.length,
    icon: <BookOpen size={16} className="text-indigo-500" />,
  },
  {
    address: "/enrollments",
    text: "Enrollments",
    count: enrollments.length,
    icon: <ClipboardList size={16} className="text-indigo-500" />,
  },
  {
    address: "/lessons",
    text: "Lessons",
    count: lessons.length,
    icon: <FileText size={16} className="text-indigo-500" />,
  },
  {
    address: "/assignments",
    text: "Assignments",
    count: assignments.length,
    icon: <ClipboardList size={16} className="text-indigo-500" />,
  },
  {
    address: "/submissions",
    text: "Submissions",
    count: submissions.length,
    icon: <Send size={16} className="text-indigo-500" />,
  },
  {
    address: "/results",
    text: "Results",
    count: results.length,
    icon: <Trophy size={16} className="text-indigo-500" />,
  },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, admin"
        subtitle="A quick count of everything in the system."
      />

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
              {tile.count}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
