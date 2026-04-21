import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

function StatCard({ title, value, color }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        setStats(data);
      } catch {
        showToast("Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [showToast]);

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-red-600">Dashboard data unavailable.</p>;
  }

  const total = stats.total_appointments || 1;
  const completedPercent = Math.round((stats.completed_appointments / total) * 100);
  const pendingPercent = 100 - completedPercent;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Patients" value={stats.total_patients} color="text-teal-700" />
        <StatCard title="Total Doctors" value={stats.total_doctors} color="text-indigo-700" />
        <StatCard title="Appointments" value={stats.total_appointments} color="text-orange-700" />
        <StatCard title="Completed" value={stats.completed_appointments} color="text-emerald-700" />
      </div>

      <div className="rounded bg-white p-5 shadow">
        <h3 className="font-semibold text-slate-700">Appointment Status</h3>
        <div className="mt-4 h-4 overflow-hidden rounded bg-slate-200">
          <div className="h-full bg-emerald-500" style={{ width: `${completedPercent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm text-slate-600">
          <span>Completed: {completedPercent}%</span>
          <span>Pending: {pendingPercent}%</span>
        </div>
      </div>
    </div>
  );
}
