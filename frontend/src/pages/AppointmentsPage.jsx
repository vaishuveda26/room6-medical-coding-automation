import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const consultationModes = [
  { value: "in_person", label: "In Person" },
  { value: "video", label: "Video" },
  { value: "phone", label: "Phone" },
];

const appointmentPriorities = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "follow_up", label: "Follow Up" },
];

const appointmentStatuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const initialBookForm = {
  patient_id: "",
  doctor_id: "",
  date: "",
  consultation_mode: "in_person",
  priority: "routine",
  duration_minutes: "30",
  reason_for_visit: "",
  symptoms: "",
  notes: "",
};

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UpdateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getMinAppointmentDateTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [editForm, setEditForm] = useState({
    status: "scheduled",
    consultation_mode: "in_person",
    priority: "routine",
    duration_minutes: "30",
    reason_for_visit: "",
    symptoms: "",
    notes: "",
  });
  const [editId, setEditId] = useState(null);
  const [minAppointmentDate, setMinAppointmentDate] = useState(() => getMinAppointmentDateTime());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadAppointments = async (query = search, status = statusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (status) params.set("status_filter", status);
      const queryString = params.toString();
      const { data } = await api.get(`/appointments${queryString ? `?${queryString}` : ""}`);
      setAppointments(data);
    } catch {
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBookingData = async () => {
    if (user?.role !== "admin") return;
    const [patientsResponse, doctorsResponse] = await Promise.all([api.get("/patients"), api.get("/doctors")]);
    setPatients(patientsResponse.data);
    setDoctors(doctorsResponse.data);
  };

  useEffect(() => {
    loadBookingData().catch(() => showToast("Could not load booking lists", "error"));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAppointments(search, statusFilter);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleBook = async (event) => {
    event.preventDefault();

    const selectedDate = new Date(bookForm.date);
    if (!bookForm.date || Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
      showToast("Appointment date must be later than the current time", "error");
      return;
    }

    try {
      await api.post("/appointments", {
        patient_id: Number(bookForm.patient_id),
        doctor_id: Number(bookForm.doctor_id),
        date: selectedDate.toISOString(),
        consultation_mode: bookForm.consultation_mode,
        priority: bookForm.priority,
        duration_minutes: Number(bookForm.duration_minutes),
        reason_for_visit: bookForm.reason_for_visit,
        symptoms: bookForm.symptoms || null,
        notes: bookForm.notes || null,
      });
      showToast("Appointment booked");
      setShowModal(false);
      setBookForm(initialBookForm);
      setMinAppointmentDate(getMinAppointmentDateTime());
      loadAppointments();
    } catch (error) {
      showToast(error.response?.data?.detail || "Booking failed", "error");
    }
  };

  const openEdit = (appointment) => {
    setEditId(appointment.id);
    setEditForm({
      status: appointment.status,
      consultation_mode: appointment.consultation_mode,
      priority: appointment.priority,
      duration_minutes: String(appointment.duration_minutes),
      reason_for_visit: appointment.reason_for_visit,
      symptoms: appointment.symptoms || "",
      notes: appointment.notes || "",
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/appointments/${editId}`, {
        ...editForm,
        duration_minutes: Number(editForm.duration_minutes),
      });
      showToast("Appointment updated");
      setEditId(null);
      loadAppointments();
    } catch (error) {
      showToast(error.response?.data?.detail || "Update failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Appointments</h2>
          <p className="page-subtitle">Coordinate scheduling, statuses, and visit context from a single operational view.</p>
        </div>
        <div className="toolbar-group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, code, or symptoms"
            className="min-w-72"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-52"
          >
            <option value="">All Statuses</option>
            {appointmentStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          {user?.role === "admin" && (
            <button
              onClick={() => {
                setMinAppointmentDate(getMinAppointmentDateTime());
                setBookForm(initialBookForm);
                setShowModal(true);
              }}
              className="btn-primary inline-flex items-center justify-center"
              title="Book Appointment"
              aria-label="Book Appointment"
            >
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
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Visit Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              appointments.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.appointment_code}</td>
                  <td className="px-4 py-3">{item.patient_name}</td>
                  <td className="px-4 py-3">{item.doctor_name}</td>
                  <td className="px-4 py-3">
                    <div>{new Date(item.date).toLocaleString()}</div>
                    <div className="text-sm text-slate-500">{item.duration_minutes} min • {item.consultation_mode.replaceAll("_", " ")}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{item.reason_for_visit}</div>
                    <div className="text-sm text-slate-500">Priority: {item.priority.replaceAll("_", " ")}</div>
                    <div className="text-sm text-slate-500">{item.symptoms || "No symptoms added"}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{item.notes || "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(item)} className="btn-secondary inline-flex items-center justify-center p-2.5" title="Update Appointment" aria-label="Update Appointment">
                      <UpdateIcon />
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
          <form onSubmit={handleBook} className="modal-card max-w-2xl">
            <h3 className="text-lg font-semibold">Book Appointment</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select className="w-full rounded border px-3 py-2" value={bookForm.patient_id} onChange={(e) => setBookForm((prev) => ({ ...prev, patient_id: e.target.value }))} required>
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
              <select className="w-full rounded border px-3 py-2" value={bookForm.doctor_id} onChange={(e) => setBookForm((prev) => ({ ...prev, doctor_id: e.target.value }))} required>
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
              <select className="w-full rounded border px-3 py-2" value={bookForm.consultation_mode} onChange={(e) => setBookForm((prev) => ({ ...prev, consultation_mode: e.target.value }))} required>
                {consultationModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
              <select className="w-full rounded border px-3 py-2" value={bookForm.priority} onChange={(e) => setBookForm((prev) => ({ ...prev, priority: e.target.value }))} required>
                {appointmentPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
              <input
                className="w-full rounded border px-3 py-2"
                type="datetime-local"
                min={minAppointmentDate}
                value={bookForm.date}
                onChange={(e) => setBookForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
              <input
                className="w-full rounded border px-3 py-2"
                type="number"
                min="15"
                step="15"
                max="180"
                placeholder="Duration in minutes"
                value={bookForm.duration_minutes}
                onChange={(e) => setBookForm((prev) => ({ ...prev, duration_minutes: e.target.value }))}
                required
              />
              <input
                className="w-full rounded border px-3 py-2 md:col-span-2"
                placeholder="Reason for visit"
                value={bookForm.reason_for_visit}
                onChange={(e) => setBookForm((prev) => ({ ...prev, reason_for_visit: e.target.value }))}
                required
              />
              <textarea
                className="w-full rounded border px-3 py-2 md:col-span-2"
                rows={3}
                placeholder="Symptoms"
                value={bookForm.symptoms}
                onChange={(e) => setBookForm((prev) => ({ ...prev, symptoms: e.target.value }))}
              />
              <textarea
                className="w-full rounded border px-3 py-2 md:col-span-2"
                rows={3}
                placeholder="Booking notes"
                value={bookForm.notes}
                onChange={(e) => setBookForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <p className="text-sm text-slate-500 md:col-span-2">Appointment date must be greater than the current time. The system also blocks overlapping doctor slots.</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {editId && (
        <div className="modal-backdrop">
          <form onSubmit={handleUpdate} className="modal-card max-w-2xl">
            <h3 className="text-lg font-semibold">Update Appointment</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select className="w-full rounded border px-3 py-2" value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}>
                {appointmentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select className="w-full rounded border px-3 py-2" value={editForm.consultation_mode} onChange={(e) => setEditForm((prev) => ({ ...prev, consultation_mode: e.target.value }))}>
                {consultationModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
              <select className="w-full rounded border px-3 py-2" value={editForm.priority} onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}>
                {appointmentPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
              <input className="w-full rounded border px-3 py-2" type="number" min="15" step="15" max="180" placeholder="Duration in minutes" value={editForm.duration_minutes} onChange={(e) => setEditForm((prev) => ({ ...prev, duration_minutes: e.target.value }))} />
              <input className="w-full rounded border px-3 py-2 md:col-span-2" placeholder="Reason for visit" value={editForm.reason_for_visit} onChange={(e) => setEditForm((prev) => ({ ...prev, reason_for_visit: e.target.value }))} />
              <textarea className="w-full rounded border px-3 py-2 md:col-span-2" rows={3} placeholder="Symptoms" value={editForm.symptoms} onChange={(e) => setEditForm((prev) => ({ ...prev, symptoms: e.target.value }))} />
              <textarea className="w-full rounded border px-3 py-2 md:col-span-2" rows={4} placeholder="Notes / Prescription" value={editForm.notes} onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
              <button className="btn-primary">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
