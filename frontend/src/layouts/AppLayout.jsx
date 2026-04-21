import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", tag: "OV" },
  { to: "/patients", label: "Patients", roles: ["admin"], tag: "PT" },
  { to: "/doctors", label: "Doctors", roles: ["admin"], tag: "DR" },
  { to: "/medicines", label: "Medicines", tag: "RX" },
  { to: "/appointments", label: "Appointments", tag: "AP" },
];

const pageTitles = {
  "/dashboard": "Operations Dashboard",
  "/patients": "Patient Management",
  "/doctors": "Doctor Management",
  "/medicines": "Medicine Master",
  "/appointments": "Appointment Operations",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-6 xl:items-start">
        <aside className="app-surface hidden w-80 shrink-0 p-6 xl:block">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-800 via-cyan-700 to-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/90">Room 6 Health</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Medical Back Office</h1>
            <p className="mt-2 text-sm text-cyan-50/80">
              Unified operations for appointments, patients, providers, and medicine management.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed In</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{user?.name}</p>
            <p className="mt-1 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
              {user?.role}
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navLinks
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-cyan-700 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xs font-bold tracking-[0.2em]">
                    {item.tag}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>

          <button onClick={logout} className="btn-danger mt-8 w-full">
            Logout
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="app-surface mb-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Company Workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {pageTitles[location.pathname] || "Medical Back Office"}
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-700 text-sm font-bold text-white">
                {user?.name?.slice(0, 2).toUpperCase() || "US"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</p>
              </div>
            </div>
          </header>

          <main className="space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
