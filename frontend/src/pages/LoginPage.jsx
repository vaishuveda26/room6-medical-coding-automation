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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800">Login</h2>
        <p className="mt-1 text-sm text-slate-500">Access your medical automation dashboard</p>

        <div className="mt-4 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <button
          disabled={loading}
          className="mt-5 w-full rounded bg-brand px-3 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          No account? <Link to="/register" className="text-brand">Register</Link>
        </p>
      </form>
    </div>
  );
}
