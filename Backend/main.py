from fastapi import FastAPI ,Depends ,HTTPException ,Path
from sqlalchemy.orm import Session
from database import SessionLocal , engine
import schemas
import models 

# Create all tables
models.Base.metadata.create_all(bind=engine)
app=FastAPI()


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
def get_all_employees(db: Session = Depends(get_db)):
    """Get all employees"""
    employees = db.query(models.Employee).all()
    return employees

@app.get("/employees/department/{department_name}", response_model=list[schemas.EmployeeResponse])
def get_employees_by_department(
    department_name: str = Path(..., description="Enter the department name", example="HR"),
    db: Session = Depends(get_db)
):
    """Get all employees in a specific department"""
    department = db.query(models.Department).filter(models.Department.name == department_name).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department.employees

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
def get_all_salaries(db: Session = Depends(get_db)):
    """Get all salary records"""
    salaries = db.query(models.Salary).all()
    return salaries


@app.get("/salaries/employee/{employee_id}", response_model=list[schemas.SalaryResponse])
def get_employee_salaries(employee_id: int, db: Session = Depends(get_db)):
    """Get salary history for a specific employee"""
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee.salaries


@app.get("/salaries/department/{department_name}", response_model=list[schemas.SalaryResponse])
def get_salaries_by_department(department_name: str, db: Session = Depends(get_db)):
    """Get all salary records for employees in a specific department"""
    department = db.query(models.Department).filter(models.Department.name == department_name).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    salaries = []
    for employee in department.employees:
        salaries.extend(employee.salaries)
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
def get_all_attendance(db: Session = Depends(get_db)):
    """Get all attendance records"""
    attendance = db.query(models.Attendance).all()
    return attendance


@app.get("/attendance/employee/{employee_id}", response_model=list[schemas.AttendanceResponse])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    """Get attendance records for a specific employee"""
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee.attendance_records


@app.get("/attendance/department/{department_name}", response_model=list[schemas.AttendanceResponse])
def get_attendance_by_department(department_name: str, db: Session = Depends(get_db)):
    """Get all attendance records for employees in a specific department"""
    department = db.query(models.Department).filter(models.Department.name == department_name).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    attendance = []
    for employee in department.employees:
        attendance.extend(employee.attendance_records)
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