from datetime import datetime
from pydantic import BaseModel


class DashboardRecentItem(BaseModel):
    id: int
    title: str
    subtitle: str | None = None


class DashboardAppointmentItem(BaseModel):
    id: int
    appointment_code: str
    patient_name: str
    doctor_name: str
    date: datetime
    status: str
    priority: str
    consultation_mode: str
    reason_for_visit: str


class DashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_medicines: int
    total_appointments: int
    scheduled_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    no_show_appointments: int
    today_appointments_count: int
    tomorrow_appointments_count: int
    recent_patients: list[DashboardRecentItem]
    recent_doctors: list[DashboardRecentItem]
    recent_medicines: list[DashboardRecentItem]
    today_appointments: list[DashboardAppointmentItem]
    tomorrow_appointments: list[DashboardAppointmentItem]
    filtered_appointments: list[DashboardAppointmentItem]
