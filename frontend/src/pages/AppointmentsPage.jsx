import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookForm, setBookForm] = useState({ patient_id: "", doctor_id: "", date: "" });
  const [editForm, setEditForm] = useState({ status: "pending", notes: "" });
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/appointments");
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
    loadAppointments();
    loadBookingData().catch(() => showToast("Could not load booking lists", "error"));
  }, []);

  const handleBook = async (event) => {
    event.preventDefault();
    try {
      await api.post("/appointments", {
        patient_id: Number(bookForm.patient_id),
        doctor_id: Number(bookForm.doctor_id),
        date: new Date(bookForm.date).toISOString(),
      });
      showToast("Appointment booked");
      setShowModal(false);
      setBookForm({ patient_id: "", doctor_id: "", date: "" });
      loadAppointments();
    } catch (error) {
      showToast(error.response?.data?.detail || "Booking failed", "error");
    }
  };

  const openEdit = (appointment) => {
    setEditId(appointment.id);
    setEditForm({ status: appointment.status, notes: appointment.notes || "" });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/appointments/${editId}`, editForm);
      showToast("Appointment updated");
      setEditId(null);
      loadAppointments();
    } catch (error) {
      showToast(error.response?.data?.detail || "Update failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
        {user?.role === "admin" && (
          <button onClick={() => setShowModal(true)} className="rounded bg-brand px-3 py-2 text-white">
            Book Appointment
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              appointments.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.patient_name}</td>
                  <td className="px-4 py-3">{item.doctor_name}</td>
                  <td className="px-4 py-3">{new Date(item.date).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3">{item.notes || "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(item)} className="rounded bg-slate-700 px-2 py-1 text-sm text-white">
                      Update
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
          <form onSubmit={handleBook} className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Book Appointment</h3>
            <div className="mt-3 space-y-3">
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
              <input className="w-full rounded border px-3 py-2" type="datetime-local" value={bookForm.date} onChange={(e) => setBookForm((prev) => ({ ...prev, date: e.target.value }))} required />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="rounded bg-brand px-3 py-2 text-white">Save</button>
            </div>
          </form>
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={handleUpdate} className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Update Appointment</h3>
            <div className="mt-3 space-y-3">
              <select className="w-full rounded border px-3 py-2" value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <textarea className="w-full rounded border px-3 py-2" rows={4} placeholder="Notes / Prescription" value={editForm.notes} onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2" onClick={() => setEditId(null)}>Cancel</button>
              <button className="rounded bg-brand px-3 py-2 text-white">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
