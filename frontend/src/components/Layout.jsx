import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, UserRound, Users, X } from "lucide-react";
import { useState } from "react";
import { clearLogin, getUser } from "../auth.js";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard, ["admin", "teacher", "student"]],
  ["Courses", "/courses", BookOpen, ["admin", "teacher", "student"]],
  ["Lessons", "/lessons", GraduationCap, ["admin", "teacher", "student"]],
  ["Assignments", "/assignments", BookOpen, ["admin", "teacher", "student"]],
  ["Submissions", "/submissions", BookOpen, ["admin", "teacher", "student"]],
  ["Results", "/results", GraduationCap, ["admin", "teacher", "student"]],
  ["Enrollments", "/enrollments", Users, ["admin", "teacher"]],
  ["Teachers", "/teachers", Users, ["admin"]],
  ["Students", "/students", Users, ["admin"]],
];

export default function Layout({ children, title }) {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();
  const items = nav.filter(([, , , roles]) => roles.includes(user?.role));
  const logout = () => { clearLogin(); navigate("/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-white transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2 font-bold"><BookOpen className="h-6 w-6" /> LMS</div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav className="space-y-1 p-3">
          {items.map(([label, path, Icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-indigo-600" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</NavLink>)}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-3">
          <NavLink to="/profile" className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"><UserRound className="h-4 w-4" />Profile</NavLink>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"><LogOut className="h-4 w-4" />Log out</button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button><h1 className="text-lg font-semibold">{title}</h1></div>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">{user?.username?.charAt(0).toUpperCase()}</span>{user?.username}</button>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
