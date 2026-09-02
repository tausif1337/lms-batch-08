import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  forgetLoggedInUser,
  getLoggedInUser,
  getRefreshToken,
  updateLoggedInUser,
} from "../auth.js";
import { getMyProfile, logout } from "../api.js";
import { cn } from "../lib/cn.js";
import ThemeToggle from "./ui/ThemeToggle.jsx";

const EVERY_ROLE = ["admin", "teacher", "student"];
const ADMIN_AND_TEACHER = ["admin", "teacher"];
const ADMIN_ONLY = ["admin"];

/** Grouping gives the rail a scannable shape instead of one long list of ten. */
const MENU_GROUPS = [
  {
    label: null,
    items: [
      { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard, allowedRoles: EVERY_ROLE },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "Courses", path: "/courses", Icon: BookOpen, allowedRoles: EVERY_ROLE },
      { label: "Lessons", path: "/lessons", Icon: GraduationCap, allowedRoles: EVERY_ROLE },
      { label: "Assignments", path: "/assignments", Icon: ClipboardList, allowedRoles: EVERY_ROLE },
      { label: "Submissions", path: "/submissions", Icon: FileText, allowedRoles: EVERY_ROLE },
      { label: "Results", path: "/results", Icon: GraduationCap, allowedRoles: EVERY_ROLE },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Enrollments", path: "/enrollments", Icon: Users, allowedRoles: ADMIN_AND_TEACHER },
      { label: "Teachers", path: "/teachers", Icon: Users, allowedRoles: ADMIN_ONLY },
      { label: "Students", path: "/students", Icon: Users, allowedRoles: ADMIN_ONLY },
      { label: "Create account", path: "/register", Icon: UserPlus, allowedRoles: ADMIN_ONLY },
    ],
  },
];

function menuGroupsForRole(role) {
  return MENU_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.allowedRoles.includes(role)),
  })).filter(group => group.items.length > 0);
}

function initialsOf(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

function MenuLink({ label, path, Icon, onNavigate }) {
  function styleFor({ isActive }) {
    return cn(
      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-primary font-semibold text-primary-fg"
        : "text-rail-fg-muted hover:bg-rail-hover hover:text-rail-fg",
    );
  }

  return (
    <NavLink to={path} onClick={onNavigate} className={styleFor}>
      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      {label}
    </NavLink>
  );
}

function Sidebar({ user, isOpenOnPhone, onClose, onLogOut }) {
  const slideStyle = isOpenOnPhone ? "translate-x-0" : "-translate-x-full lg:translate-x-0";

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-rail transition-transform duration-200 ease-out",
        slideStyle,
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-rail-line px-5">
        <div className="flex items-center gap-2.5 text-rail-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-brand-950">
            <BookOpen aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <span className="font-bold tracking-tight">LMS</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-rail-fg-muted transition hover:bg-rail-hover hover:text-rail-fg lg:hidden"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {menuGroupsForRole(user?.role).map(group => (
          <div key={group.label || "top"} className="space-y-1">
            {group.label && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-rail-fg-muted/70">
                {group.label}
              </p>
            )}
            {group.items.map(item => (
              <MenuLink
                key={item.path}
                label={item.label}
                path={item.path}
                Icon={item.Icon}
                onNavigate={onClose}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-rail-line p-3">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-rail-hover"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-brand-950">
            {initialsOf(user?.username)}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium text-rail-fg">
              {user?.username}
            </span>
            <span className="block truncate text-xs capitalize text-rail-fg-muted">
              {user?.role}
            </span>
          </span>
          <UserRound aria-hidden="true" className="h-4 w-4 shrink-0 text-rail-fg-muted" />
        </NavLink>

        <button
          type="button"
          onClick={onLogOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rail-fg-muted transition hover:bg-rail-hover hover:text-rail-fg"
        >
          <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, user, onOpenMenu, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="-ml-1 rounded-lg p-2 text-content-muted transition hover:bg-surface-muted hover:text-content lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold tracking-tight text-content">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-1 text-sm font-medium transition hover:border-line-strong hover:bg-surface-muted sm:pr-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">
            {initialsOf(user?.username)}
          </span>
          <span className="hidden max-w-32 truncate text-content sm:block">{user?.username}</span>
        </button>
      </div>
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

/** Module level so a page load asks once, not once per route change. */
let roleHasBeenCheckedThisPageLoad = false;

export default function Layout({ children, title }) {
  const [isMenuOpenOnPhone, setIsMenuOpenOnPhone] = useState(false);
  const [user, setUser] = useState(getLoggedInUser);
  const goToPage = useNavigate();
  const { pathname } = useLocation();

  // The role in storage was written at login and never looked at again, so an
  // admin changing somebody's role left them with the old menus until they
  // next signed in. Asking the server once per page load keeps what is shown
  // in step with what the API will actually allow. Once, not per navigation:
  // the role is not going to change while somebody clicks around.
  useEffect(() => {
    if (roleHasBeenCheckedThisPageLoad) {
      return;
    }

    roleHasBeenCheckedThisPageLoad = true;

    getMyProfile()
      .then(answer => {
        updateLoggedInUser(answer.user);
        setUser(answer.user);
      })
      .catch(() => {
        // A dead session is already handled by api.js, which signs the user
        // out and sends them to the login page. Anything else and the stored
        // role is the best we have, so the menus stay as they were.
      });
  }, []);

  function closeMenu() {
    setIsMenuOpenOnPhone(false);
  }

  // A tap on a link changes the route; the drawer should not stay over the page.
  // Adjusted during render rather than in an effect so it lands in the same
  // commit as the navigation and never paints the drawer over the new page.
  const [pathnameWhenDrawerLastChecked, setPathnameWhenDrawerLastChecked] = useState(pathname);

  if (pathname !== pathnameWhenDrawerLastChecked) {
    setPathnameWhenDrawerLastChecked(pathname);
    setIsMenuOpenOnPhone(false);
  }

  useEffect(() => {
    if (!isMenuOpenOnPhone) {
      return;
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpenOnPhone]);

  async function handleLogOut() {
    await tellServerToEndSessionIfPossible();

    forgetLoggedInUser();
    // Signing in again does not reload the page, so without this the next
    // account to use this tab would inherit the answer given for the last one.
    roleHasBeenCheckedThisPageLoad = false;
    goToPage("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-fg"
      >
        Skip to content
      </a>

      {isMenuOpenOnPhone && (
        <div
          onClick={closeMenu}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <Sidebar
        user={user}
        isOpenOnPhone={isMenuOpenOnPhone}
        onClose={closeMenu}
        onLogOut={handleLogOut}
      />

      <div className="lg:pl-[264px]">
        <TopBar
          title={title}
          user={user}
          onOpenMenu={() => setIsMenuOpenOnPhone(true)}
          onOpenProfile={() => goToPage("/profile")}
        />
        <main id="main-content" className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
