import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "" });
  const { showToast } = useToast();

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/doctors");
      setDoctors(data);
    } catch {
      showToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    try {
      await api.post("/doctors", form);
      showToast("Doctor added");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", specialization: "" });
      loadDoctors();
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to add doctor", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Doctors</h2>
        <button onClick={() => setShowModal(true)} className="rounded bg-brand px-3 py-2 text-white">
          Add Doctor
        </button>
      </div>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Doctor ID</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              doctors.map((doctor) => (
                <tr key={doctor.id} className="border-t">
                  <td className="px-4 py-3">{doctor.name}</td>
                  <td className="px-4 py-3">{doctor.specialization}</td>
                  <td className="px-4 py-3">#{doctor.id}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-slate-500">Loading...</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleAdd} className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Add Doctor</h3>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} required />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="rounded bg-brand px-3 py-2 text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
