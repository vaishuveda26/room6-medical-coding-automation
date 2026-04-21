import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/patients", label: "Patients", roles: ["admin"] },
  { to: "/doctors", label: "Doctors", roles: ["admin"] },
  { to: "/appointments", label: "Appointments" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="bg-slate-900 p-5 text-white md:min-h-screen md:w-64">
        <h1 className="text-xl font-bold">Medical Automation</h1>
        <p className="mt-1 text-sm text-slate-300">{user?.name}</p>
        <p className="text-xs uppercase text-emerald-300">{user?.role}</p>

        <nav className="mt-6 space-y-2">
          {navLinks
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${
                    isActive ? "bg-emerald-600" : "bg-slate-800 hover:bg-slate-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <button
          onClick={logout}
          className="mt-8 w-full rounded bg-rose-600 px-3 py-2 text-sm hover:bg-rose-700"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
