import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        specialization: form.role === "doctor" ? form.specialization : null,
      };
      const { data } = await api.post("/auth/register", payload);
      login(data);
      showToast("Account created");
      navigate("/dashboard");
    } catch (error) {
      showToast(error.response?.data?.detail || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex items-center justify-center p-4">
      <div className="auth-panel grid max-w-6xl gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center justify-center border-b border-slate-100 p-6 md:p-10 lg:border-b-0 lg:border-r">
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Company Onboarding</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Create Access</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Set up an administrative or doctor account to start managing healthcare operations inside the shared workspace.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-800">Admin Access</p>
                <p className="mt-1 text-sm text-slate-500">Manage patients, providers, medicines, and appointment operations.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-800">Doctor Access</p>
                <p className="mt-1 text-sm text-slate-500">View schedules, update appointments, and support care coordination.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/40 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
            <div className="space-y-4">
              <input
                className="w-full"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                className="w-full"
                type="email"
                placeholder="Work Email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                className="w-full"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <select
                className="w-full"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>

              {form.role === "doctor" && (
                <input
                  className="w-full"
                  placeholder="Specialization"
                  value={form.specialization}
                  onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  required
                />
              )}
            </div>

            <button disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? "Creating account..." : "Register"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              Already registered? <Link to="/login" className="font-semibold text-cyan-700">Login</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
