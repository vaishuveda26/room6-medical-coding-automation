import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../hooks/useToast";

const consultationStatuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const consultationModes = [
  { value: "in_person", label: "In Person" },
  { value: "video", label: "Video" },
  { value: "phone", label: "Phone" },
];

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 21h14a2 2 0 0 0 2-2V7l-4-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3v5h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddMedicineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [consultationSearch, setConsultationSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    status: "scheduled",
    consultation_mode: "in_person",
    reason_for_visit: "",
    symptoms: "",
    notes: "",
    prescriptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const selectedConsultation = consultations.find((item) => item.id === selectedId) || null;

  const loadConsultations = async (query = consultationSearch) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      const queryString = params.toString();
      const { data } = await api.get(`/consultations${queryString ? `?${queryString}` : ""}`);
      setConsultations(data);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
      if (!data.length) {
        setSelectedId(null);
      }
    } catch {
      showToast("Failed to load consultations", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async (query = medicineSearch) => {
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      const queryString = params.toString();
      const { data } = await api.get(`/medicines${queryString ? `?${queryString}` : ""}`);
      setMedicines(data);
    } catch {
      showToast("Failed to load medicines", "error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConsultations(consultationSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [consultationSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedicines(medicineSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [medicineSearch]);

  useEffect(() => {
    if (!selectedConsultation) {
      return;
    }
    setForm({
      status: selectedConsultation.status,
      consultation_mode: selectedConsultation.consultation_mode,
      reason_for_visit: selectedConsultation.reason_for_visit,
      symptoms: selectedConsultation.symptoms || "",
      notes: selectedConsultation.notes || "",
      prescriptions: selectedConsultation.prescriptions.map((item) => ({
        medicine_id: item.medicine_id,
        medicine_code: item.medicine_code,
        medicine_name: item.medicine_name,
        dosage: item.dosage || "",
        instructions: item.instructions || "",
      })),
    });
  }, [selectedConsultation]);

  const addPrescription = (medicine) => {
    setForm((prev) => {
      if (prev.prescriptions.some((item) => item.medicine_id === medicine.id)) {
        return prev;
      }
      return {
        ...prev,
        prescriptions: [
          ...prev.prescriptions,
          {
            medicine_id: medicine.id,
            medicine_code: medicine.code,
            medicine_name: medicine.name,
            dosage: medicine.dosage || "",
            instructions: "",
          },
        ],
      };
    });
  };

  const updatePrescription = (medicineId, field, value) => {
    setForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((item) =>
        item.medicine_id === medicineId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removePrescription = (medicineId) => {
    setForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((item) => item.medicine_id !== medicineId),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    try {
      setSaving(true);
      await api.put(`/consultations/${selectedId}`, {
        status: form.status,
        consultation_mode: form.consultation_mode,
        reason_for_visit: form.reason_for_visit,
        symptoms: form.symptoms || null,
        notes: form.notes || null,
        prescriptions: form.prescriptions.map((item) => ({
          medicine_id: item.medicine_id,
          dosage: item.dosage || null,
          instructions: item.instructions || null,
        })),
      });
      showToast("Consultation saved");
      await loadConsultations(consultationSearch);
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to save consultation", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.55fr]">
      <section className="app-surface p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="page-title">Consultations</h2>
            <p className="page-subtitle">One workspace for patient arrival, doctor consultation, and medicine prescription.</p>
          </div>
        </div>
        <div className="mt-4">
          <input
            value={consultationSearch}
            onChange={(e) => setConsultationSearch(e.target.value)}
            placeholder="Search patient, doctor, code"
            className="w-full"
          />
        </div>
        <div className="mt-5 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading consultations...</p>
          ) : consultations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
              No consultations available.
            </div>
          ) : (
            consultations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedId === item.id
                    ? "border-cyan-300 bg-cyan-50/80 shadow-sm"
                    : "border-slate-200 bg-white/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.patient_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.appointment_code}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <p>Doctor: {item.doctor_name}</p>
                  <p className="mt-1">{new Date(item.date).toLocaleString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="app-surface p-5">
        {!selectedConsultation ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
            Select a consultation from the left to start the doctor workflow.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Patient Came</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{selectedConsultation.patient_name}</h3>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <p>Age: {selectedConsultation.patient_age}</p>
                  <p>Gender: {selectedConsultation.patient_gender}</p>
                  <p>Phone: {selectedConsultation.patient_phone}</p>
                  <p>Doctor: {selectedConsultation.doctor_name}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Meeting With Doctor</p>
                <div className="mt-3 grid gap-3">
                  <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                    {consultationStatuses.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select value={form.consultation_mode} onChange={(e) => setForm((prev) => ({ ...prev, consultation_mode: e.target.value }))}>
                    {consultationModes.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Reason for Visit</label>
                  <input value={form.reason_for_visit} onChange={(e) => setForm((prev) => ({ ...prev, reason_for_visit: e.target.value }))} className="mt-2 w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Symptoms</label>
                  <textarea value={form.symptoms} onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))} className="mt-2 w-full" rows={4} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Consultation Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="mt-2 w-full" rows={5} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Prescription</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">Doctor Prescribes Medicine</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    placeholder="Search medicine by name, code, symptoms"
                    className="w-full"
                  />
                </div>
                <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div>
                        <p className="font-medium text-slate-900">{medicine.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{medicine.code}</p>
                        <p className="mt-1 text-xs text-slate-500">{medicine.symptoms}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addPrescription(medicine)}
                        className="btn-secondary inline-flex items-center justify-center p-2.5"
                        title="Add medicine"
                      >
                        <AddMedicineIcon />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {form.prescriptions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                      No medicines selected yet.
                    </div>
                  ) : (
                    form.prescriptions.map((item) => (
                      <div key={item.medicine_id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.medicine_name}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.medicine_code}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePrescription(item.medicine_id)}
                            className="btn-danger px-3 py-2 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          <input
                            value={item.dosage}
                            onChange={(e) => updatePrescription(item.medicine_id, "dosage", e.target.value)}
                            placeholder="Dosage"
                          />
                          <textarea
                            value={item.instructions}
                            onChange={(e) => updatePrescription(item.medicine_id, "instructions", e.target.value)}
                            placeholder="Instructions"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
                <SaveIcon />
                <span>{saving ? "Saving..." : "Save Consultation"}</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
