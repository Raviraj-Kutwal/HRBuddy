from typing import Optional
from fastapi import FastAPI ,Depends ,HTTPException ,Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal , engine
import schemas
import models 
import pandas as pd
import pickle
import sklearn
from sklearn.preprocessing import StandardScaler
# Create all tables
models.Base.metadata.create_all(bind=engine)
app=FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#database_helper_function:
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# ══════════════════════════════════════════════════════════════
# EMPLOYEE ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/employees", response_model=list[schemas.EmployeeResponse])
def get_all_employees(
    department_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all employees, optionally filtered by department"""
    if department_name:
        department = db.query(models.Department).filter(models.Department.name == department_name).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
        return department.employees
        
    employees = db.query(models.Employee).all()
    return employees

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeResponse)
def get_employee_by_id(employee_id: int, db: Session = Depends(get_db)):
    """Get a single employee by ID"""
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee





@app.post("/employees", response_model=schemas.EmployeeResponse, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee"""
    # Check if email already exists
    existing_employee = db.query(models.Employee).filter(models.Employee.email == employee.email).first()
    if existing_employee:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if department exists
    department = db.query(models.Department).filter(models.Department.id == employee.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    new_employee = models.Employee(**employee.model_dump())
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@app.put("/employees/{employee_id}", response_model=schemas.EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: schemas.EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """Update an employee"""
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Update only provided fields
    update_data = employee.model_dump(exclude_unset=True)
    
    # Check if email is being updated and if it already exists
    if "email" in update_data:
        existing = db.query(models.Employee).filter(
            models.Employee.email == update_data["email"],
            models.Employee.id != employee_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if department exists
    if "department_id" in update_data:
        department = db.query(models.Department).filter(models.Department.id == update_data["department_id"]).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
    
    for key, value in update_data.items():
        setattr(db_employee, key, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee


@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Delete an employee"""
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}


# ══════════════════════════════════════════════════════════════
# SALARY ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/salaries", response_model=list[schemas.SalaryResponse])
def get_all_salaries(
    employee_id: Optional[int] = None,
    department_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all salary records, optionally filtered by employee or department"""
    if employee_id:
        employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee.salaries
        
    if department_name:
        department = db.query(models.Department).filter(models.Department.name == department_name).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
        
        salaries = []
        for employee in department.employees:
            salaries.extend(employee.salaries)
        return salaries
        
    salaries = db.query(models.Salary).all()
    return salaries


@app.post("/salaries", response_model=schemas.SalaryResponse, status_code=201)
def create_salary(salary: schemas.SalaryCreate, db: Session = Depends(get_db)):
    """Create a new salary record"""
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.id == salary.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    new_salary = models.Salary(**salary.model_dump())
    db.add(new_salary)
    db.commit()
    db.refresh(new_salary)
    return new_salary


@app.put("/salaries/{salary_id}", response_model=schemas.SalaryResponse)
def update_salary(
    salary_id: int,
    salary: schemas.SalaryUpdate,
    db: Session = Depends(get_db)
):
    """Update a salary record"""
    db_salary = db.query(models.Salary).filter(models.Salary.id == salary_id).first()
    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    
    update_data = salary.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_salary, key, value)
    
    db.commit()
    db.refresh(db_salary)
    return db_salary


@app.delete("/salaries/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    """Delete a salary record"""
    db_salary = db.query(models.Salary).filter(models.Salary.id == salary_id).first()
    if not db_salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    
    db.delete(db_salary)
    db.commit()
    return {"message": "Salary record deleted successfully"}


# ══════════════════════════════════════════════════════════════
# ATTENDANCE ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/attendance", response_model=list[schemas.AttendanceResponse])
def get_all_attendance(
    employee_id: Optional[int] = None,
    department_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all attendance records, optionally filtered by employee or department"""
    if employee_id:
        employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee.attendance_records
        
    if department_name:
        department = db.query(models.Department).filter(models.Department.name == department_name).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
        
        attendance = []
        for employee in department.employees:
            attendance.extend(employee.attendance_records)
        return attendance
        
    attendance = db.query(models.Attendance).all()
    return attendance


@app.post("/attendance", response_model=schemas.AttendanceResponse, status_code=201)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee"""
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if attendance already marked for this date
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
    
    new_attendance = models.Attendance(**attendance.model_dump())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance


@app.put("/attendance/{attendance_id}", response_model=schemas.AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance: schemas.AttendanceUpdate,
    db: Session = Depends(get_db)
):
    """Update an attendance record"""
    db_attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    update_data = attendance.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_attendance, key, value)
    
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@app.delete("/attendance/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    """Delete an attendance record"""
    db_attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(db_attendance)
    db.commit()
    return {"message": "Attendance record deleted successfully"}


# ══════════════════════════════════════════════════════════════
# DEPARTMENT ENDPOINTS (BONUS)
# ══════════════════════════════════════════════════════════════

@app.get("/departments", response_model=list[schemas.DepartmentResponse])
def get_all_departments(db: Session = Depends(get_db)):
    """Get all departments"""
    departments = db.query(models.Department).all()
    return departments


@app.post("/departments", response_model=schemas.DepartmentResponse, status_code=201)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    """Create a new department"""
    # Check if department name already exists
    existing = db.query(models.Department).filter(models.Department.name == department.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_department = models.Department(**department.model_dump())
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department


@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    """Delete a department"""
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if department has employees
    if department.employees:
        raise HTTPException(status_code=400, detail="Cannot delete department with employees")
    
    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}


with open("new_model.pkl", "rb") as f:
    model = pickle.load(f)
    
with open("scaler_new.pkl", "rb") as f:
    scaler = pickle.load(f)
    
@app.post("/prediction", response_model=schemas.PredictionResponse)
def makePrediction(data:schemas.UserInputMLPrediction):
    raw_input = pd.DataFrame([{
        "OverTime_Yes": data.OverTime,
        "JobRole_Laboratory Technician": data.IsLabTechnician,
        "BusinessTravel_Travel_Frequently": data.Business_Travel_Frequency,
        "YearsAtCompany": data.YearsAtCompany,
        "YearsInCurrentRole": data.YearsInCurrentRole,
        "MaritalStatus_Single": data.MaritalStatus_Single
    }])
    scaled_input = scaler.transform(raw_input)
    result = model.predict(scaled_input)[0]
    probability = float(model.predict_proba(scaled_input)[0][1])

    return {
        "Prediction": bool(result),
        "Probability of Attrition": probability,
        "risk_level": "High" if probability >= 0.6 else "Moderate" if probability >= 0.35 else "Low",
        "risk_percentage": round(probability * 100, 2)
    }