import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.js";
import { ADMIN, roleLabel } from "./permissions.js";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Trophy,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

// Whether the sidebar is collapsed is remembered across reloads, the same way
// the session is. It is only a preference, so a broken value is not worth
// guarding against beyond the === "true" check.
const COLLAPSED_KEY = "lms:sidebarCollapsed";

const menu = [
  { address: "/", text: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { address: "/teachers", text: "Teachers", icon: <Users size={16} /> },
  { address: "/students", text: "Students", icon: <GraduationCap size={16} /> },
  { address: "/courses", text: "Courses", icon: <BookOpen size={16} /> },
  {
    address: "/enrollments",
    text: "Enrollments",
    icon: <ClipboardList size={16} />,
  },
  { address: "/lessons", text: "Lessons", icon: <FileText size={16} /> },
  {
    address: "/assignments",
    text: "Assignments",
    icon: <ClipboardList size={16} />,
  },
  { address: "/submissions", text: "Submissions", icon: <Send size={16} /> },
  { address: "/results", text: "Results", icon: <Trophy size={16} /> },
  // `onlyFor` keeps a link out of the sidebar for other roles. The route and
  // the API check the role again; this is only about not offering it.
  {
    address: "/accounts",
    text: "Accounts",
    icon: <UserPlus size={16} />,
    onlyFor: ADMIN,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true",
  );

  // Narrow screens have no room for a permanent menu, so there it slides in
  // over the page instead. This is kept apart from `isCollapsed`, which is the
  // wide-screen preference and the only one worth remembering.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Escape closes the drawer, the same as the confirm dialog.
  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const visibleMenu = menu.filter(
    (item) => !item.onlyFor || item.onlyFor === user?.role,
  );

  function handleLogOut() {
    logOut();
    navigate("/login", { replace: true });
  }

  // Tapping a link on a phone should take you to the page, not leave the menu
  // sitting on top of it. Closing it here rather than in an effect on the
  // address keeps it to the one event that actually calls for it.
  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  // The drawer is always full width, so the icon-only layout is a wide-screen
  // thing only. That is why the collapsed classes below carry md: prefixes
  // instead of simply replacing the expanded ones.
  const rowLayout = isCollapsed
    ? "gap-3 px-3 md:justify-center md:px-0"
    : "gap-3 px-3";

  // Labels disappear when the sidebar is collapsed, but only from md up.
  const labelVisibility = isCollapsed ? "md:hidden" : "";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* The backdrop exists only while the drawer is open, and only below md.
          It is what catches a tap outside the menu. */}
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        />
      )}

      <div
        className={
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 " +
          (isDrawerOpen ? "translate-x-0 " : "-translate-x-full ") +
          // From md up it stops floating and becomes part of the layout again,
          // and the animation moves from the position to the width.
          "md:static md:translate-x-0 md:transition-[width] " +
          (isCollapsed ? "md:w-16" : "md:w-60")
        }
      >
        <div
          className={
            "flex items-center gap-2 border-b border-slate-200 px-4 py-4 " +
            (isCollapsed ? "md:justify-center md:px-2" : "")
          }
        >
          {/* Collapsed, the toggle takes the logo's place: at that width there
              is room for one thing, and the way back out matters more. The
              drawer is never collapsed, so it keeps the logo either way. */}
          {isCollapsed ? (
            <>
              <button
                onClick={() => setIsCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                aria-expanded={false}
                className="hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:block"
              >
                <PanelLeftOpen size={20} />
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <GraduationCap size={22} className="text-indigo-600" />
                <span className="text-lg font-semibold text-slate-900">
                  LMS
                </span>
              </div>
            </>
          ) : (
            <>
              <GraduationCap size={22} className="text-indigo-600" />
              <span className="text-lg font-semibold text-slate-900">LMS</span>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                aria-expanded={true}
                className="ml-auto hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:block"
              >
                <PanelLeftClose size={20} />
              </button>
            </>
          )}

          {/* Closing the drawer from inside it. Wide screens keep the menu on
              show, so there is nothing to close there. */}
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {visibleMenu.map((item) => {
            const isTheCurrentPage = location.pathname === item.address;

            let colours = "text-slate-600 hover:bg-slate-100";
            if (isTheCurrentPage) {
              colours = "bg-indigo-50 font-medium text-indigo-700";
            }

            return (
              <Link
                key={item.address}
                to={item.address}
                onClick={closeDrawer}
                title={isCollapsed ? item.text : undefined}
                className={
                  "mb-1 flex items-center rounded-md py-2 text-sm " +
                  rowLayout +
                  " " +
                  colours
                }
              >
                {item.icon}
                <span className={labelVisibility}>{item.text}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-3">
          {/* The name doubles as the way into your own profile. */}
          <Link
            to="/profile"
            onClick={closeDrawer}
            title={
              isCollapsed
                ? `${user?.username ?? "Signed in"} (${roleLabel(user?.role)})`
                : undefined
            }
            className={
              "mb-1 flex items-center rounded-md py-2 text-sm " +
              rowLayout +
              " " +
              (location.pathname === "/profile"
                ? "bg-indigo-50 font-medium text-indigo-700"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            <UserRound size={16} />

            <span
              className={
                "flex min-w-0 flex-1 items-center gap-2 " + labelVisibility
              }
            >
              <span className="truncate">{user?.username ?? "Signed in"}</span>
              <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {roleLabel(user?.role)}
              </span>
            </span>
          </Link>

          <button
            onClick={handleLogOut}
            title={isCollapsed ? "Log out" : undefined}
            className={
              "flex w-full items-center rounded-md py-2 text-sm text-slate-600 hover:bg-slate-100 " +
              rowLayout
            }
          >
            <LogOut size={16} />
            <span className={labelVisibility}>Log out</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The only way to reach the menu on a phone. It stays out of the way
            on wider screens, where the sidebar is already there. */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <GraduationCap size={20} className="text-indigo-600" />
          <span className="font-semibold text-slate-900">LMS</span>
        </div>

        <div className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
