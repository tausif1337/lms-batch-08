import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, ShieldCheck, UserPlus, Users } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { getLoggedInUser } from "../auth.js";

const CARDS_FOR_ADMIN = [
  { title: "Teachers", description: "Manage teaching staff", path: "/teachers", Icon: Users },
  { title: "Students", description: "Manage student records", path: "/students", Icon: Users },
  { title: "Courses", description: "Manage courses", path: "/courses", Icon: BookOpen },
  { title: "Enrollments", description: "Manage enrollments", path: "/enrollments", Icon: GraduationCap },
  { title: "Create account", description: "Add a student, teacher or admin", path: "/register", Icon: UserPlus },
];

const CARDS_FOR_TEACHER = [
  { title: "Courses", description: "Manage your course catalog", path: "/courses", Icon: BookOpen },
  { title: "Lessons", description: "Manage course lessons", path: "/lessons", Icon: GraduationCap },
  { title: "Assignments", description: "Create and manage assignments", path: "/assignments", Icon: BookOpen },
  { title: "Results", description: "Grade submissions", path: "/results", Icon: ShieldCheck },
];

const CARDS_FOR_STUDENT = [
  { title: "Courses", description: "Browse available courses", path: "/courses", Icon: BookOpen },
  { title: "Lessons", description: "View course lessons", path: "/lessons", Icon: GraduationCap },
  { title: "Assignments", description: "View your assignments", path: "/assignments", Icon: BookOpen },
  { title: "Submissions", description: "Submit and review work", path: "/submissions", Icon: ShieldCheck },
  { title: "Results", description: "See your grades and feedback", path: "/results", Icon: ShieldCheck },
];

function cardsForRole(role) {
  if (role === "admin") {
    return CARDS_FOR_ADMIN;
  }

  if (role === "teacher") {
    return CARDS_FOR_TEACHER;
  }

  return CARDS_FOR_STUDENT;
}

function WelcomeBanner({ role, name }) {
  return (
    <div className="mb-8 rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="mb-2 text-sm text-indigo-300">{role?.toUpperCase()} PORTAL</p>
      <h2 className="text-2xl font-bold sm:text-3xl">Welcome back, {name}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-300">
        Manage your learning workflow from one place. Your available actions follow the permissions
        enforced by the backend.
      </p>
    </div>
  );
}

function ShortcutCard({ title, description, path, Icon }) {
  return (
    <Link
      to={path}
      className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}

export default function Dashboard() {
  const user = getLoggedInUser();
  const cards = cardsForRole(user?.role);

  return (
    <Layout title="Dashboard">
      <WelcomeBanner role={user?.role} name={user?.first_name || user?.username} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <ShortcutCard
            key={card.path}
            title={card.title}
            description={card.description}
            path={card.path}
            Icon={card.Icon}
          />
        ))}
      </div>
    </Layout>
  );
}
