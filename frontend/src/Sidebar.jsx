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
  Send,
  Trophy,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

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

  const visibleMenu = menu.filter(
    (item) => !item.onlyFor || item.onlyFor === user?.role,
  );

  function handleLogOut() {
    logOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
          <GraduationCap size={22} className="text-indigo-600" />
          <span className="text-lg font-semibold text-slate-900">LMS</span>
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
                className={
                  "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm " +
                  colours
                }
              >
                {item.icon}
                {item.text}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-3">
          {/* The name doubles as the way into your own profile. */}
          <Link
            to="/profile"
            className={
              "mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm " +
              (location.pathname === "/profile"
                ? "bg-indigo-50 font-medium text-indigo-700"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            <UserRound size={16} />
            <span className="truncate">{user?.username ?? "Signed in"}</span>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {roleLabel(user?.role)}
            </span>
          </Link>

          <button
            onClick={handleLogOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}
