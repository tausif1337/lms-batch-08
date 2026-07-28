// The frame around every logged-in page: sidebar on the left, content on the right.

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Send,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teachers", label: "Teachers", icon: Users },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/enrollments", label: "Enrollments", icon: ClipboardList },
  { to: "/lessons", label: "Lessons", icon: FileText },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/submissions", label: "Submissions", icon: Send },
  { to: "/results", label: "Results", icon: Trophy },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
          <GraduationCap size={22} className="text-indigo-600" />
          <span className="text-lg font-semibold text-slate-900">LMS</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2 px-2 text-sm text-slate-600">
            <UserRound size={16} />
            <span className="truncate">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
