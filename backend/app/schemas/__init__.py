from .user import UserBase, UserResponse
from .auth import RegisterRequest, LoginRequest, TokenResponse
from .patient import PatientCreate, PatientResponse
from .doctor import DoctorCreate, DoctorResponse
from .appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from .dashboard import DashboardStats

__all__ = [
    "UserBase",
    "UserResponse",
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "PatientCreate",
    "PatientResponse",
    "DoctorCreate",
    "DoctorResponse",
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "DashboardStats",
]
