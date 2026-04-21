import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const initialForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  blood_group: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
};

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 6 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4h8v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
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
    const timer = setTimeout(() => {
      loadPatients(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditId(patient.id);
    setForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || "",
      address: patient.address || "",
      blood_group: patient.blood_group || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editId) {
        await api.put(`/patients/${editId}`, payload);
        showToast("Patient updated");
      } else {
        await api.post("/patients", payload);
        showToast("Patient added");
      }
      setShowModal(false);
      resetForm();
      loadPatients(search);
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to save patient", "error");
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
        <div>
          <h2 className="page-title">Patients</h2>
          <p className="page-subtitle">Maintain patient records, contact details, and emergency information.</p>
        </div>
        <div className="toolbar-group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="min-w-60"
          />
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center justify-center" title="Add Patient" aria-label="Add Patient">
            <AddIcon />
          </button>
        </div>
      </div>

      <div className="data-shell overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Standard Details</th>
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
                  <td className="px-4 py-3">
                    <div>{patient.phone}</div>
                    <div className="text-sm text-slate-500">{patient.email || "No email"}</div>
                  </td>
                  <td className="px-4 py-3">{patient.address || "-"}</td>
                  <td className="px-4 py-3">
                    <div>Blood Group: {patient.blood_group || "-"}</div>
                    <div className="text-sm text-slate-500">
                      Emergency: {patient.emergency_contact_name || "-"} {patient.emergency_contact_phone ? `(${patient.emergency_contact_phone})` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(patient)} className="btn-secondary inline-flex items-center justify-center p-2.5" title="Edit Patient" aria-label="Edit Patient">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="btn-danger inline-flex items-center justify-center p-2.5" title="Delete Patient" aria-label="Delete Patient">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-slate-500">Loading...</p>}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <form onSubmit={handleSubmit} className="modal-card max-w-md">
            <h3 className="text-lg font-semibold">{editId ? "Edit Patient" : "Add Patient"}</h3>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} required />
              <select className="w-full rounded border px-3 py-2" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} required>
                <option value="">Select Gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input className="w-full rounded border px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <textarea className="w-full rounded border px-3 py-2" rows={3} placeholder="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
              <select className="w-full rounded border px-3 py-2" value={form.blood_group} onChange={(e) => setForm((prev) => ({ ...prev, blood_group: e.target.value }))}>
                <option value="">Select Blood Group</option>
                {bloodGroupOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input className="w-full rounded border px-3 py-2" placeholder="Emergency Contact Name" value={form.emergency_contact_name} onChange={(e) => setForm((prev) => ({ ...prev, emergency_contact_name: e.target.value }))} />
              <input className="w-full rounded border px-3 py-2" placeholder="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={(e) => setForm((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </button>
              <button className="btn-primary">{editId ? "Update" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
