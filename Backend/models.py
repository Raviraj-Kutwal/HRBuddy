from sqlalchemy import declarative_base
from sqlalchemy import Column ,Integer,Float ,String,Boolean ,ForeignKey ,Enum ,Date
import enum 
from sqlalchemy.orm import relationship
Base=declarative_base()


class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    HALF_DAY = "half_day"
    SICK_LEAVE = "sick_leave"
    VACATION = "vacation"
    UNPAID_LEAVE = "unpaid_leave"


class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    
    employees = relationship("Employee", back_populates="department")
    
class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    
    department_id = Column(Integer, ForeignKey("departments.id"),nullable=False)
    
    department = relationship("Department", back_populates="employees")
    salaries = relationship("Salary", back_populates="employee")
    attendance_records = relationship("Attendance", back_populates="employee")
    
class Salary(Base):
    __tablename__ = "employee_salaries"
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"),nullable=False)
    salary = Column(Float, nullable=False)
    month_and_year=Column(Date,nullable=False)
    
    employee = relationship("Employee", back_populates="salaries")
    
class Attendance(Base):
    __tablename__ = "employee_attendance"
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    employee = relationship("Employee", back_populates="attendance_records")