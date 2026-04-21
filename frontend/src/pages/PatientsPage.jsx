import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "" });
  const { showToast } = useToast();

  const loadPatients = async (query = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(`/patients${query ? `?search=${query}` : ""}`);
      setPatients(data);
    } catch {
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    try {
      await api.post("/patients", { ...form, age: Number(form.age) });
      showToast("Patient added");
      setShowModal(false);
      setForm({ name: "", age: "", gender: "", phone: "" });
      loadPatients(search);
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to add patient", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/patients/${id}`);
      showToast("Patient deleted");
      loadPatients(search);
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Patients</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="rounded border border-slate-300 px-3 py-2"
          />
          <button onClick={() => loadPatients(search)} className="rounded bg-slate-700 px-3 py-2 text-white">
            Search
          </button>
          <button onClick={() => setShowModal(true)} className="rounded bg-brand px-3 py-2 text-white">
            Add Patient
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              patients.map((patient) => (
                <tr key={patient.id} className="border-t">
                  <td className="px-4 py-3">{patient.name}</td>
                  <td className="px-4 py-3">{patient.age}</td>
                  <td className="px-4 py-3">{patient.gender}</td>
                  <td className="px-4 py-3">{patient.phone}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="rounded bg-rose-600 px-2 py-1 text-sm text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-slate-500">Loading...</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleAdd} className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Add Patient</h3>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Gender" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
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
