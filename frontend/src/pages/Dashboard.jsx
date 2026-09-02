import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Badge, Skeleton } from "../components/ui/index.js";
import { getList } from "../api.js";
import { getLoggedInUser } from "../auth.js";
import { recordsFrom } from "../lib/records.js";

const CARDS_FOR_ADMIN = [
  { title: "Teachers", description: "Manage teaching staff", path: "/teachers", Icon: Users },
  { title: "Students", description: "Manage student records", path: "/students", Icon: Users },
  { title: "Courses", description: "Manage courses", path: "/courses", Icon: BookOpen },
  {
    title: "Enrollments",
    description: "Manage enrollments",
    path: "/enrollments",
    Icon: GraduationCap,
  },
  {
    title: "Create account",
    description: "Add a student, teacher or admin",
    path: "/register",
    Icon: UserPlus,
  },
];

const CARDS_FOR_TEACHER = [
  { title: "Courses", description: "Manage your course catalog", path: "/courses", Icon: BookOpen },
  { title: "Lessons", description: "Manage course lessons", path: "/lessons", Icon: GraduationCap },
  {
    title: "Assignments",
    description: "Create and manage assignments",
    path: "/assignments",
    Icon: ClipboardList,
  },
  { title: "Results", description: "Grade submissions", path: "/results", Icon: ShieldCheck },
];

const CARDS_FOR_STUDENT = [
  { title: "Courses", description: "Browse available courses", path: "/courses", Icon: BookOpen },
  { title: "Lessons", description: "View course lessons", path: "/lessons", Icon: GraduationCap },
  {
    title: "Assignments",
    description: "View your assignments",
    path: "/assignments",
    Icon: ClipboardList,
  },
  {
    title: "Submissions",
    description: "Submit and review work",
    path: "/submissions",
    Icon: FileText,
  },
  {
    title: "Results",
    description: "See your grades and feedback",
    path: "/results",
    Icon: ShieldCheck,
  },
];

/** Only lists the role is allowed to read, so the dashboard never fires a
 *  request the backend will answer with 403. */
const STATS_FOR_ROLE = {
  admin: [
    { listName: "teachers", label: "Teachers", path: "/teachers", Icon: Users },
    { listName: "students", label: "Students", path: "/students", Icon: Users },
    { listName: "courses", label: "Courses", path: "/courses", Icon: BookOpen },
    { listName: "enrollments", label: "Enrollments", path: "/enrollments", Icon: GraduationCap },
  ],
  teacher: [
    { listName: "courses", label: "Courses", path: "/courses", Icon: BookOpen },
    { listName: "lessons", label: "Lessons", path: "/lessons", Icon: GraduationCap },
    { listName: "assignments", label: "Assignments", path: "/assignments", Icon: ClipboardList },
    { listName: "submissions", label: "Submissions", path: "/submissions", Icon: FileText },
  ],
  student: [
    { listName: "courses", label: "Courses", path: "/courses", Icon: BookOpen },
    { listName: "lessons", label: "Lessons", path: "/lessons", Icon: GraduationCap },
    { listName: "assignments", label: "Assignments", path: "/assignments", Icon: ClipboardList },
    { listName: "results", label: "Results", path: "/results", Icon: ShieldCheck },
  ],
};

// Module-level so `STATS_FOR_ROLE[role] || NO_STATS` is referentially stable
// across renders and can be an effect dependency without useMemo.
const NO_STATS = [];

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
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-rail p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-700/25 blur-3xl"
      />

      <div className="relative">
        <Badge tone="brand" className="bg-white/10 text-brand-300 ring-white/15">
          {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} portal` : "Portal"}
        </Badge>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-rail-fg sm:text-3xl">
          Welcome back, {name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-rail-fg-muted">
          Manage your learning workflow from one place. Your available actions follow the
          permissions enforced by the backend.
        </p>
      </div>
    </div>
  );
}

function StatTile({ label, count, path, Icon, isLoading }) {
  return (
    <Link
      to={path}
      className="group rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-line-strong hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-content-muted">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
          <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-14" />
      ) : (
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-content">
          {count ?? "—"}
        </p>
      )}
    </Link>
  );
}

function ShortcutCard({ title, description, path, Icon }) {
  return (
    <Link
      to={path}
      className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-line-strong hover:shadow-lift"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-on-soft transition group-hover:bg-primary group-hover:text-primary-fg">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-semibold text-content">
          {title}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 text-content-subtle transition group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </span>
        <span className="mt-1 block text-sm text-content-muted">{description}</span>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const user = getLoggedInUser();
  const role = user?.role;
  const cards = cardsForRole(role);
  const stats = STATS_FOR_ROLE[role] || NO_STATS;

  const [countForEachList, setCountForEachList] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(stats.length > 0);

  useEffect(() => {
    if (stats.length === 0) {
      return;
    }

    let pageWasClosed = false;

    async function loadCounts() {
      const entries = await Promise.all(
        stats.map(async stat => {
          try {
            const answer = await getList(stat.listName);
            return [stat.listName, recordsFrom(answer).length];
          } catch {
            // A failed count is not worth an error banner; the tile shows "—".
            return [stat.listName, null];
          }
        }),
      );

      if (pageWasClosed) {
        return;
      }

      setCountForEachList(Object.fromEntries(entries));
      setIsLoadingCounts(false);
    }

    loadCounts();

    return () => {
      pageWasClosed = true;
    };
  }, [stats]);

  return (
    <Layout title="Dashboard">
      <WelcomeBanner role={role} name={user?.first_name || user?.username} />

      {stats.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <StatTile
              key={stat.listName}
              label={stat.label}
              path={stat.path}
              Icon={stat.Icon}
              count={countForEachList[stat.listName]}
              isLoading={isLoadingCounts}
            />
          ))}
        </div>
      )}

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-content-subtle">
        Quick actions
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
