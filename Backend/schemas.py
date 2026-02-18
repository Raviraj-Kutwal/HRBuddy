from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date as DateType
from enum import Enum

class AttendanceStatus(str, Enum):  # ✅ Note: str, Enum
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    HALF_DAY = "half_day"
    SICK_LEAVE = "sick_leave"
    VACATION = "vacation"
    UNPAID_LEAVE = "unpaid_leave"

# =========================
# Department Schemas
# =========================

class DepartmentCreate(BaseModel):
    name: str


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


# =========================
# Salary Schemas
# =========================

class SalaryCreate(BaseModel):
    employee_id: int
    salary: float
    month_and_year: DateType


class SalaryUpdate(BaseModel):
    salary: Optional[float] = None
    month_and_year: Optional[DateType] = None


class SalaryResponse(BaseModel):
    id: int
    employee_id: int
    salary: float
    month_and_year: DateType

    model_config = {
        "from_attributes": True
    }


# =========================
# Attendance Schemas
# =========================

class AttendanceCreate(BaseModel):
    employee_id: int
    date: DateType
    status: AttendanceStatus


class AttendanceUpdate(BaseModel):
    date: Optional[DateType] = None
    status: Optional[AttendanceStatus] = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: DateType
    status: AttendanceStatus

    model_config = {
        "from_attributes": True
    }


# =========================
# Employee Schemas
# =========================

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: int


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None


class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    department_id: int

    

    model_config = {
        "from_attributes": True
    }
