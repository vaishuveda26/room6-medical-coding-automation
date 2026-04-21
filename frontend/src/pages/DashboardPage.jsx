import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

function OverviewCard({ eyebrow, title, value, note, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] border px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl ${
        tone === "teal"
          ? "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-cyan-100/70"
          : tone === "amber"
            ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-100/70"
            : tone === "rose"
              ? "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/70"
              : "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-100/70"
      }`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/40 blur-2xl transition group-hover:scale-125" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
      <p className="relative mt-4 text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="relative mt-2 text-base font-semibold text-slate-800">{title}</p>
      <p className="relative mt-1 text-sm text-slate-500">{note}</p>
    </button>
  );
}

function HighlightPanel({ stats }) {
  return (
    <section className="app-surface relative overflow-hidden p-6">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(27,151,166,0.08),transparent_60%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Daily Snapshot</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Operations At A Glance</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Track patient growth, provider availability, medicine catalog coverage, and the live appointment queue from one control center.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{stats.today_appointments_count}</p>
              <p className="mt-1 text-sm text-slate-500">Appointments to manage today</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tomorrow</p>
              <p className="mt-2 text-3xl font-semibold text-sky-700">{stats.tomorrow_appointments_count}</p>
              <p className="mt-1 text-sm text-slate-500">Appointments already lined up</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Completed</p>
              <p className="mt-2 text-3xl font-semibold text-violet-700">{stats.completed_appointments}</p>
              <p className="mt-1 text-sm text-slate-500">Visits closed successfully</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white/90 px-5 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Appointments</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{stats.total_appointments}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled</span>
                <span className="font-semibold text-slate-900">{stats.scheduled_appointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cancelled</span>
                <span className="font-semibold text-slate-900">{stats.cancelled_appointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">No Show</span>
                <span className="font-semibold text-slate-900">{stats.no_show_appointments}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/85 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Readiness</p>
            <p className="mt-3 text-lg font-semibold text-slate-800">Back-office coverage is live across every core module.</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use the cards below to jump directly into Patients, Doctors, Medicines, and Appointments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleList({ items, title, tone }) {
  return (
    <section
      className={`rounded-[28px] border p-5 ${
        tone === "today"
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/70"
          : tone === "tomorrow"
            ? "border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-indigo-100/60"
            : "border-slate-200 bg-white/85"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">Focused operational appointment view with priority, doctor, and visit reason.</p>
        </div>
        <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-sm font-medium text-slate-700">
          {items.length} items
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
            No appointments available in this view.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.patient_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.appointment_code}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">When</p>
                  <p className="mt-1 font-medium text-slate-800">{new Date(item.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Doctor</p>
                  <p className="mt-1 font-medium text-slate-800">{item.doctor_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Priority</p>
                  <p className="mt-1 font-medium text-slate-800">{item.priority.replaceAll("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Mode</p>
                  <p className="mt-1 font-medium text-slate-800">{item.consultation_mode.replaceAll("_", " ")}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Visit Reason</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{item.reason_for_visit}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RecentPanel({ title, items }) {
  return (
    <section className="app-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
            No recent records available.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
              <p className="font-medium text-slate-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.subtitle || "-"}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [scheduleView, setScheduleView] = useState("today");
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status_filter", statusFilter);
        const queryString = params.toString();
        const { data } = await api.get(`/dashboard/stats${queryString ? `?${queryString}` : ""}`);
        setStats(data);
      } catch {
        showToast("Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [statusFilter, showToast]);

  if (loading) {
    return (
      <div className="app-surface p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Loading</p>
        <p className="mt-3 text-2xl font-semibold text-slate-800">Preparing dashboard data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="app-surface p-8">
        <p className="text-lg font-semibold text-rose-700">Dashboard data unavailable.</p>
      </div>
    );
  }

  const activeAppointments =
    scheduleView === "today"
      ? stats.today_appointments
      : scheduleView === "tomorrow"
        ? stats.tomorrow_appointments
        : stats.filtered_appointments;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Executive View</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Operations Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            A company-standard overview of patient volume, provider coverage, medicine readiness, and live appointment activity.
          </p>
        </div>
        <div className="toolbar-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-56">
            <option value="">All Appointment Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      <HighlightPanel stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          eyebrow="Module"
          title="Patients"
          value={stats.total_patients}
          note="Open and manage the patient master list"
          tone="teal"
          onClick={() => navigate("/patients")}
        />
        <OverviewCard
          eyebrow="Module"
          title="Doctors"
          value={stats.total_doctors}
          note="Review providers, qualifications, and profiles"
          tone="indigo"
          onClick={() => navigate("/doctors")}
        />
        <OverviewCard
          eyebrow="Module"
          title="Medicines"
          value={stats.total_medicines}
          note="Open the medicine master and symptom mapping"
          tone="amber"
          onClick={() => navigate("/medicines")}
        />
        <OverviewCard
          eyebrow="Module"
          title="Appointments"
          value={stats.total_appointments}
          note="Go to the full scheduling operations workspace"
          tone="rose"
          onClick={() => navigate("/appointments")}
        />
      </div>

      <section className="app-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Schedule Outlook</h3>
            <p className="mt-1 text-sm text-slate-500">
              Today is highlighted first, with quick switching into tomorrow and the wider appointment queue.
            </p>
          </div>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => setScheduleView("today")}
              className={scheduleView === "today" ? "btn-primary" : "btn-secondary"}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setScheduleView("tomorrow")}
              className={scheduleView === "tomorrow" ? "btn-primary" : "btn-secondary"}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setScheduleView("queue")}
              className={scheduleView === "queue" ? "btn-primary" : "btn-secondary"}
            >
              Extended View
            </button>
          </div>
        </div>

        <div className="mt-5">
          <ScheduleList
            title={
              scheduleView === "today"
                ? "Today’s Appointments"
                : scheduleView === "tomorrow"
                  ? "Tomorrow’s Appointments"
                  : "Extended Queue"
            }
            items={activeAppointments}
            tone={scheduleView}
          />
        </div>
      </section>

      {user?.role === "admin" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <RecentPanel title="Recent Patients" items={stats.recent_patients} />
          <RecentPanel title="Recent Doctors" items={stats.recent_doctors} />
          <RecentPanel title="Recent Medicines" items={stats.recent_medicines} />
        </div>
      )}
    </div>
  );
}
