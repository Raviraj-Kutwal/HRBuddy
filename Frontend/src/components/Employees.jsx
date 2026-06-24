import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { employeesApi, departmentsApi } from '../services/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBaseData();
  }, [filterDept]);

  async function loadBaseData() {
    try {
      setLoading(true);
      const [empData, deptData] = await Promise.all([
        employeesApi.getAll(filterDept || null),
        departmentsApi.getAll().catch(() => [])
      ]);
      setEmployees(empData);
      setDepartments(deptData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditMode(false);
    setSelectedEmpId(null);
    setFormData({ name: '', email: '', phone: '', department_id: departments[0]?.id || '' });
    setShowModal(true);
  }

  function handleOpenEdit(emp) {
    setEditMode(true);
    setSelectedEmpId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department_id: emp.department_id
    });
    setShowModal(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department_id) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        department_id: Number(formData.department_id)
      };

      if (editMode) {
        const updated = await employeesApi.update(selectedEmpId, payload);
        setEmployees(employees.map(e => e.id === selectedEmpId ? updated : e));
        setSuccess('Employee updated successfully!');
      } else {
        const created = await employeesApi.create(payload);
        setEmployees([...employees, created]);
        setSuccess('Employee registered successfully!');
      }

      setShowModal(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      alert(`Validation / Submission Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you certain you wish to purge this employee record? Connected attendance & salaries will cascade or alert depending on DB keys.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await employeesApi.delete(id);
      setEmployees(employees.filter(e => e.id !== id));
      setSuccess('Employee record deleted successfully.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  // Lookup Department Name Helper
  const deptMap = departments.reduce((acc, d) => {
    acc[d.id] = d.name;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls */}
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Personnel Database</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage employee profile metadata, credentials, and structural mapping</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Department Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} className="text-muted" />
            <select 
              className="input-field" 
              style={{ padding: '0.5rem 2.5rem 0.5rem 1rem', width: 'auto', margin: 0, fontSize: '0.85rem' }}
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Dynamic System Banners */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.15)', borderLeft: '4px solid #ef4444', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.15)', borderLeft: '4px solid #10b981', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6ee7b7' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving secure database schema records...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3>No Employee Profiles Found</h3>
            <p>Adjust your dynamic query parameters or click "Add Employee" to seed table</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Full Name</th>
                  <th>Email Account</th>
                  <th>Contact Info</th>
                  <th>Assigned Department</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-accent)' }}>#{emp.id}</td>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{emp.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{emp.phone || '—'}</td>
                    <td>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }}>
                        {deptMap[emp.department_id] || `Dept #${emp.department_id}`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--text-accent)' }}
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(emp.id)}
                          title="Purge Profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation / Update Modal overlay */}
      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel" style={{ padding: '2rem', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              {editMode ? 'Modify Employee Contract' : 'Onboard New Employee'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Jane Doe"
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Corporate Email *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Contact</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Department Assignment *</label>
                <select 
                  className="input-field" 
                  value={formData.department_id}
                  onChange={e => setFormData({...formData, department_id: e.target.value})}
                  required
                >
                  <option value="">Select a mapping...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Transmitting...' : editMode ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
