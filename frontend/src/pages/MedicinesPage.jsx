import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  code: "",
  name: "",
  symptoms: "",
  dosage: "",
  description: "",
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

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const loadMedicines = async (query = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(`/medicines${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      setMedicines(data);
    } catch {
      showToast("Failed to load medicines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedicines(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editId) {
        await api.put(`/medicines/${editId}`, form);
        showToast("Medicine updated");
      } else {
        await api.post("/medicines", form);
        showToast("Medicine added");
      }

      setShowModal(false);
      resetForm();
      loadMedicines(search);
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to save medicine", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      showToast("Medicine deleted");
      loadMedicines(search);
    } catch (error) {
      showToast(error.response?.data?.detail || "Delete failed", "error");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (medicine) => {
    setEditId(medicine.id);
    setForm({
      code: medicine.code,
      name: medicine.name,
      symptoms: medicine.symptoms,
      dosage: medicine.dosage || "",
      description: medicine.description || "",
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Medicines</h2>
          <p className="page-subtitle">Maintain the shared medicine master for operational and clinical use.</p>
        </div>
        <div className="toolbar-group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symptoms or code"
            className="min-w-72"
          />
          {user?.role === "admin" && (
            <button onClick={openCreateModal} className="btn-primary inline-flex items-center justify-center" title="Add Medicine" aria-label="Add Medicine">
              <AddIcon />
            </button>
          )}
        </div>
      </div>

      <div className="data-shell overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Symptoms</th>
              <th className="px-4 py-3">Dosage</th>
              <th className="px-4 py-3">Description</th>
              {user?.role === "admin" && <th className="px-4 py-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              medicines.map((medicine) => (
                <tr key={medicine.id} className="border-t align-top">
                  <td className="px-4 py-3 font-medium text-slate-700">{medicine.code}</td>
                  <td className="px-4 py-3">{medicine.name}</td>
                  <td className="px-4 py-3">{medicine.symptoms}</td>
                  <td className="px-4 py-3">{medicine.dosage || "-"}</td>
                  <td className="px-4 py-3">{medicine.description || "-"}</td>
                  {user?.role === "admin" && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(medicine)} className="btn-secondary inline-flex items-center justify-center p-2.5" title="Edit Medicine" aria-label="Edit Medicine">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(medicine.id)} className="btn-danger inline-flex items-center justify-center p-2.5" title="Delete Medicine" aria-label="Delete Medicine">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-slate-500">Loading...</p>}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <form onSubmit={handleSubmit} className="modal-card max-w-xl">
            <h3 className="text-lg font-semibold">{editId ? "Edit Medicine" : "Add Medicine"}</h3>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border px-3 py-2" placeholder="Medicine Code" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Medicine Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <textarea className="w-full rounded border px-3 py-2" rows={3} placeholder="Symptoms (comma separated)" value={form.symptoms} onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))} required />
              <input className="w-full rounded border px-3 py-2" placeholder="Dosage" value={form.dosage} onChange={(e) => setForm((prev) => ({ ...prev, dosage: e.target.value }))} />
              <textarea className="w-full rounded border px-3 py-2" rows={4} placeholder="Description / Notes" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
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
