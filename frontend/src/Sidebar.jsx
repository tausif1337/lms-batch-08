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
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Trophy,
  UserPlus,
  UserRound,
  Users,
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

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const visibleMenu = menu.filter(
    (item) => !item.onlyFor || item.onlyFor === user?.role,
  );

  function handleLogOut() {
    logOut();
    navigate("/login", { replace: true });
  }

  // Collapsed rows are icon-only, so the label has to survive as a tooltip.
  const rowLayout = isCollapsed ? "justify-center px-0" : "gap-3 px-3";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div
        className={
          "flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200 " +
          (isCollapsed ? "w-16" : "w-60")
        }
      >
        <div
          className={
            "flex items-center border-b border-slate-200 py-4 " +
            (isCollapsed ? "justify-center px-2" : "gap-2 px-4")
          }
        >
          {/* Collapsed, the toggle takes the logo's place: at this width there
              is only room for one thing, and the way back out matters more. */}
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              aria-expanded={false}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <PanelLeftOpen size={20} />
            </button>
          ) : (
            <>
              <GraduationCap size={22} className="text-indigo-600" />
              <span className="text-lg font-semibold text-slate-900">LMS</span>
              <button
                onClick={() => setIsCollapsed(true)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                aria-expanded={true}
                className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <PanelLeftClose size={20} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 p-3">
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
                title={isCollapsed ? item.text : undefined}
                className={
                  "mb-1 flex items-center rounded-md py-2 text-sm " +
                  rowLayout +
                  " " +
                  colours
                }
              >
                {item.icon}
                {!isCollapsed && item.text}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-3">
          {/* The name doubles as the way into your own profile. */}
          <Link
            to="/profile"
            title={
              isCollapsed
                ? `${user?.username ?? "Signed in"} (${roleLabel(user?.role)})`
                : undefined
            }
            className={
              "mb-1 flex items-center rounded-md py-2 text-sm " +
              (isCollapsed ? "justify-center px-0 " : "gap-2 px-3 ") +
              (location.pathname === "/profile"
                ? "bg-indigo-50 font-medium text-indigo-700"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            <UserRound size={16} />
            {!isCollapsed && (
              <>
                <span className="truncate">{user?.username ?? "Signed in"}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {roleLabel(user?.role)}
                </span>
              </>
            )}
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
            {!isCollapsed && "Log out"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}
