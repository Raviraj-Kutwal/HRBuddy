// Centralized API Helper for HRBuddy application
const BASE_URL = 'http://127.0.0.1:8000';

// Universal JSON fetch wrapper with error handling
async function client(endpoint, { method = 'GET', body, ...customConfig } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const config = {
    method,
    headers,
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (err) {
    throw new Error('Network error: Unable to connect to server. Ensure Backend is running.');
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || `Server error: ${response.status}`;
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }

  return data;
}

// ==========================================
// DEPARTMENTS API
// ==========================================
export const departmentsApi = {
  getAll: () => client('/departments'),
  create: (name) => client('/departments', { method: 'POST', body: { name } }),
  delete: (id) => client(`/departments/${id}`, { method: 'DELETE' }),
};

// ==========================================
// EMPLOYEES API
// ==========================================
export const employeesApi = {
  getAll: (departmentName) => {
    const url = departmentName ? `/employees?department_name=${encodeURIComponent(departmentName)}` : '/employees';
    return client(url);
  },
  getById: (id) => client(`/employees/${id}`),
  create: (employeeData) => client('/employees', { method: 'POST', body: employeeData }),
  update: (id, employeeData) => client(`/employees/${id}`, { method: 'PUT', body: employeeData }),
  delete: (id) => client(`/employees/${id}`, { method: 'DELETE' }),
};

// ==========================================
// SALARIES API
// ==========================================
export const salariesApi = {
  getAll: (employeeId, departmentName) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (departmentName) params.append('department_name', departmentName);
    const queryString = params.toString();
    return client(queryString ? `/salaries?${queryString}` : '/salaries');
  },
  create: (salaryData) => client('/salaries', { method: 'POST', body: salaryData }),
  update: (id, salaryData) => client(`/salaries/${id}`, { method: 'PUT', body: salaryData }),
  delete: (id) => client(`/salaries/${id}`, { method: 'DELETE' }),
};

// ==========================================
// ATTENDANCE API
// ==========================================
export const attendanceApi = {
  getAll: (employeeId, departmentName) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (departmentName) params.append('department_name', departmentName);
    const queryString = params.toString();
    return client(queryString ? `/attendance?${queryString}` : '/attendance');
  },
  create: (attendanceData) => client('/attendance', { method: 'POST', body: attendanceData }),
  update: (id, attendanceData) => client(`/attendance/${id}`, { method: 'PUT', body: attendanceData }),
  delete: (id) => client(`/attendance/${id}`, { method: 'DELETE' }),
};
