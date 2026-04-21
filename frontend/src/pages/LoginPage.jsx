import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      showToast("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      showToast(error.response?.data?.detail || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex items-center justify-center p-4">
      <div className="auth-panel grid max-w-6xl gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-gradient-to-br from-cyan-800 via-cyan-700 to-slate-900 p-10 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/90">Room 6 Health</p>
          <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-tight tracking-tight">
            Back-office operations designed for speed, clarity, and clinical coordination.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-cyan-50/80">
            Manage appointments, patient records, doctors, dashboards, and medicine masters from one connected workspace.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-semibold">Live</p>
              <p className="mt-1 text-sm text-cyan-50/80">Track today’s and tomorrow’s schedules in one place.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-semibold">Unified</p>
              <p className="mt-1 text-sm text-cyan-50/80">Operational modules use one consistent data flow and design language.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Secure Access</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">Use your authorized credentials to access the medical operations workspace.</p>

            <div className="mt-8 space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Work email"
                className="w-full"
                required
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="w-full"
                required
              />
            </div>

            <button disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              No account? <Link to="/register" className="font-semibold text-cyan-700">Register</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
