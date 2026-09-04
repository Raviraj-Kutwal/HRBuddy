from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional ,Literal
from datetime import date as DateType
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"
    SICK_LEAVE = "SICK_LEAVE"
    VACATION = "VACATION"
    UNPAID_LEAVE = "UNPAID_LEAVE"

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
class UserInputMLPrediction(BaseModel):
    OverTime: Literal[0, 1]
    IsLabTechnician: Literal[0, 1]
    Business_Travel_Frequency: Literal[0, 1]
    YearsAtCompany: int
    YearsInCurrentRole: int
    MaritalStatus_Single: Literal[0, 1]

class PredictionResponse(BaseModel):
    Prediction: bool
    Probability_of_Attrition: float = Field(..., alias="Probability of Attrition")
    risk_level: Optional[str] = None
    risk_percentage: Optional[float] = None

    model_config = {
        "populate_by_name": True
    }

