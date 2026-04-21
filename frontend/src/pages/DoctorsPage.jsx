import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const initialForm = {
  name: "",
  email: "",
  password: "",
  specialization: "",
  gender: "",
  phone: "",
  address: "",
  qualification: "",
  license_number: "",
  years_of_experience: "",
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

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
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

  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      doctor.name,
      doctor.email,
      doctor.specialization,
      doctor.phone,
      doctor.address,
      doctor.qualification,
      doctor.license_number,
      doctor.gender,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditId(doctor.id);
    setForm({
      name: doctor.name,
      email: doctor.email,
      password: "",
      specialization: doctor.specialization,
      gender: doctor.gender || "",
      phone: doctor.phone || "",
      address: doctor.address || "",
      qualification: doctor.qualification || "",
      license_number: doctor.license_number || "",
      years_of_experience: String(doctor.years_of_experience ?? ""),
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        qualification: form.qualification.trim(),
        license_number: form.license_number.trim(),
        years_of_experience: Number(form.years_of_experience),
      };

      if (editId && !payload.password) {
        delete payload.password;
      }

      if (editId) {
        await api.put(`/doctors/${editId}`, payload);
        showToast("Doctor updated");
      } else {
        await api.post("/doctors", payload);
        showToast("Doctor added");
      }

      setShowModal(false);
      resetForm();
      loadDoctors();
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).join(", ")
        : detail || "Failed to save doctor";
      showToast(message, "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Doctors</h2>
          <p className="page-subtitle">Manage provider profiles, credentials, and operational contact data.</p>
        </div>
        <div className="toolbar-group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor, specialization, email"
            className="min-w-72"
          />
          <button onClick={openCreateModal} className="btn-primary inline-flex items-center justify-center" title="Add Doctor" aria-label="Add Doctor">
            <AddIcon />
          </button>
        </div>
      </div>

      <div className="data-shell overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Doctor ID</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-t">
                  <td className="px-4 py-3">{doctor.name}</td>
                  <td className="px-4 py-3">
                    <div>{doctor.phone || "No phone"}</div>
                    <div className="text-sm text-slate-500">{doctor.email}</div>
                    <div className="text-sm text-slate-500">{doctor.address || "No address"}</div>
                  </td>
                  <td className="px-4 py-3">{doctor.specialization}</td>
                  <td className="px-4 py-3">
                    <div>Gender: {doctor.gender || "-"}</div>
                    <div className="text-sm text-slate-500">{doctor.qualification || "-"}</div>
                    <div className="text-sm text-slate-500">
                      License: {doctor.license_number || "-"} | Experience: {doctor.years_of_experience ?? "-"} yrs
                    </div>
                  </td>
                  <td className="px-4 py-3">#{doctor.id}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEditModal(doctor)} className="btn-secondary inline-flex items-center justify-center p-2.5" title="Edit Doctor" aria-label="Edit Doctor">
                      <EditIcon />
                    </button>
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
            <h3 className="text-lg font-semibold">{editId ? "Edit Doctor" : "Add Doctor"}</h3>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border px-3 py-2" minLength={2} placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="password" minLength={editId ? undefined : 6} placeholder={editId ? "Password (leave blank to keep current)" : "Password"} value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required={!editId} />
              <input className="w-full rounded border px-3 py-2" minLength={2} placeholder="Specialization" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} required />
              <select className="w-full rounded border px-3 py-2" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} required>
                <option value="">Select Gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input className="w-full rounded border px-3 py-2" minLength={7} placeholder="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
              <textarea className="w-full rounded border px-3 py-2" rows={3} minLength={5} placeholder="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" minLength={2} placeholder="Qualification" value={form.qualification} onChange={(e) => setForm((prev) => ({ ...prev, qualification: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" minLength={3} placeholder="License Number" value={form.license_number} onChange={(e) => setForm((prev) => ({ ...prev, license_number: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" type="number" min="0" placeholder="Years of Experience" value={form.years_of_experience} onChange={(e) => setForm((prev) => ({ ...prev, years_of_experience: e.target.value }))} required />
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
