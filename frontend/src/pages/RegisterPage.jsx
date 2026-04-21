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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 to-slate-200 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800">Register</h2>
        <div className="mt-4 space-y-4">
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
          </select>

          {form.role === "doctor" && (
            <input
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Specialization"
              value={form.specialization}
              onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
              required
            />
          )}
        </div>

        <button
          disabled={loading}
          className="mt-5 w-full rounded bg-accent px-3 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already registered? <Link to="/login" className="text-brand">Login</Link>
        </p>
      </form>
    </div>
  );
}
