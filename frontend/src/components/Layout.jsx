import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { forgetLoggedInUser, getLoggedInUser, getRefreshToken } from "../auth.js";
import { logout } from "../api.js";

const EVERY_ROLE = ["admin", "teacher", "student"];

const MENU_ITEMS = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard, allowedRoles: EVERY_ROLE },
  { label: "Courses", path: "/courses", Icon: BookOpen, allowedRoles: EVERY_ROLE },
  { label: "Lessons", path: "/lessons", Icon: GraduationCap, allowedRoles: EVERY_ROLE },
  { label: "Assignments", path: "/assignments", Icon: BookOpen, allowedRoles: EVERY_ROLE },
  { label: "Submissions", path: "/submissions", Icon: BookOpen, allowedRoles: EVERY_ROLE },
  { label: "Results", path: "/results", Icon: GraduationCap, allowedRoles: EVERY_ROLE },
  { label: "Enrollments", path: "/enrollments", Icon: Users, allowedRoles: ["admin", "teacher"] },
  { label: "Teachers", path: "/teachers", Icon: Users, allowedRoles: ["admin"] },
  { label: "Students", path: "/students", Icon: Users, allowedRoles: ["admin"] },
  { label: "Create account", path: "/register", Icon: UserPlus, allowedRoles: ["admin"] },
];

function menuItemsForRole(role) {
  return MENU_ITEMS.filter(item => item.allowedRoles.includes(role));
}

function MenuLink({ label, path, Icon, onClick }) {
  function styleFor({ isActive }) {
    const shared = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm";
    const whenActive = "bg-indigo-600";
    const whenNotActive = "text-slate-300 hover:bg-white/10 hover:text-white";

    return `${shared} ${isActive ? whenActive : whenNotActive}`;
  }

  return (
    <NavLink to={path} onClick={onClick} className={styleFor}>
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function Sidebar({ role, isOpenOnPhone, onClose, onLogOut }) {
  const slideStyle = isOpenOnPhone ? "translate-x-0" : "-translate-x-full lg:translate-x-0";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 text-white transition-transform ${slideStyle}`}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-2 font-bold">
          <BookOpen className="h-6 w-6" />
          LMS
        </div>
        <button className="lg:hidden" onClick={onClose}>
          <X />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItemsForRole(role).map(item => (
          <MenuLink
            key={item.path}
            label={item.label}
            path={item.path}
            Icon={item.Icon}
            onClick={onClose}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <NavLink
          to="/profile"
          className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <UserRound className="h-4 w-4" />
          Profile
        </NavLink>

        <button
          onClick={onLogOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, username, onOpenMenu, onOpenProfile }) {
  const firstLetterOfUsername = username ? username.charAt(0).toUpperCase() : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onOpenMenu}>
          <Menu />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <button
        onClick={onOpenProfile}
        className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
          {firstLetterOfUsername}
        </span>
        {username}
      </button>
    </header>
  );
}

async function tellServerToEndSessionIfPossible() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return;
  }

  try {
    await logout(refreshToken);
  } catch {
    return;
  }
}

export default function Layout({ children, title }) {
  const [isMenuOpenOnPhone, setIsMenuOpenOnPhone] = useState(false);
  const user = getLoggedInUser();
  const goToPage = useNavigate();

  async function handleLogOut() {
    await tellServerToEndSessionIfPossible();

    forgetLoggedInUser();
    goToPage("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={user?.role}
        isOpenOnPhone={isMenuOpenOnPhone}
        onClose={() => setIsMenuOpenOnPhone(false)}
        onLogOut={handleLogOut}
      />

      <div className="lg:pl-64">
        <TopBar
          title={title}
          username={user?.username}
          onOpenMenu={() => setIsMenuOpenOnPhone(true)}
          onOpenProfile={() => goToPage("/profile")}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
