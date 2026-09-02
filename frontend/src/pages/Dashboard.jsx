import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, ShieldCheck, UserPlus, Users } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { getUser } from "../auth.js";

const cards = {
  admin: [
    ["Teachers", "Manage teaching staff", "/teachers", Users],
    ["Students", "Manage student records", "/students", Users],
    ["Courses", "Manage courses", "/courses", BookOpen],
    ["Enrollments", "Manage enrollments", "/enrollments", GraduationCap],
    ["Create account", "Add a student, teacher or admin", "/register", UserPlus],
  ],
  teacher: [
    ["Courses", "Manage your course catalog", "/courses", BookOpen],
    ["Lessons", "Manage course lessons", "/lessons", GraduationCap],
    ["Assignments", "Create and manage assignments", "/assignments", BookOpen],
    ["Results", "Grade submissions", "/results", ShieldCheck],
  ],
  student: [
    ["Courses", "Browse available courses", "/courses", BookOpen],
    ["Lessons", "View course lessons", "/lessons", GraduationCap],
    ["Assignments", "View your assignments", "/assignments", BookOpen],
    ["Submissions", "Submit and review work", "/submissions", ShieldCheck],
    ["Results", "See your grades and feedback", "/results", ShieldCheck],
  ],
};

export default function Dashboard() {
  const user = getUser();
  const roleCards = cards[user?.role] || cards.student;
  return <Layout title="Dashboard">
    <div className="mb-8 rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="mb-2 text-sm text-indigo-300">{user?.role?.toUpperCase()} PORTAL</p>
      <h2 className="text-2xl font-bold sm:text-3xl">Welcome back, {user?.first_name || user?.username}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">Manage your learning workflow from one place. Your available actions follow the permissions enforced by the backend.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {roleCards.map(([name, description, path, Icon]) => <Link key={path} to={path} className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div>
        <h3 className="font-semibold">{name}</h3><p className="mt-1 text-sm text-slate-500">{description}</p>
      </Link>)}
    </div>
  </Layout>;
}
