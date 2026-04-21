from .user import UserBase, UserResponse
from .auth import RegisterRequest, LoginRequest, TokenResponse
from .patient import PatientCreate, PatientResponse, PatientUpdate
from .doctor import DoctorCreate, DoctorResponse, DoctorUpdate
from .appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from .dashboard import DashboardAppointmentItem, DashboardRecentItem, DashboardStats
from .medicine import MedicineCreate, MedicineResponse, MedicineUpdate

__all__ = [
    "UserBase",
    "UserResponse",
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "PatientCreate",
    "PatientUpdate",
    "PatientResponse",
    "DoctorCreate",
    "DoctorUpdate",
    "DoctorResponse",
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "DashboardAppointmentItem",
    "DashboardRecentItem",
    "DashboardStats",
    "MedicineCreate",
    "MedicineResponse",
    "MedicineUpdate",
]
