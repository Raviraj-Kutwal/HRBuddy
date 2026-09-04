import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Trash2, Search, Filter, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { attendanceApi, employeesApi, departmentsApi } from '../services/api';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterEmpId, setFilterEmpId] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Form State
 const [formData, setFormData] = useState({
  employee_id: '',
  date: new Date().toISOString().split('T')[0],
  status: 'PRESENT'
});

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const statuses = [
  { id: 'PRESENT', label: 'Present' },
  { id: 'ABSENT', label: 'Absent' },
  { id: 'LATE', label: 'Late' },
  { id: 'HALF_DAY', label: 'Half Day' },
  { id: 'SICK_LEAVE', label: 'Sick Leave' },
  { id: 'VACATION', label: 'Vacation' },
  { id: 'UNPAID_LEAVE', label: 'Unpaid Leave' }
];

  useEffect(() => {
    loadAttendanceContext();
  }, [filterEmpId, filterDept]);

  async function loadAttendanceContext() {
    try {
      setLoading(true);
      const [attData, empData, deptData] = await Promise.all([
        attendanceApi.getAll(filterEmpId || null, filterDept || null),
        employeesApi.getAll().catch(() => []),
        departmentsApi.getAll().catch(() => [])
      ]);
      setRecords(attData);
      setEmployees(empData);
      setDepartments(deptData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAttendance(e) {
    e.preventDefault();
    if (!formData.employee_id || !formData.date || !formData.status) {
      alert('Missing input payload requirements');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        employee_id: Number(formData.employee_id),
        date: formData.date,
        status: formData.status
      };

      const newRec = await attendanceApi.create(payload);
      setRecords([newRec, ...records]);
      setSuccess('Checkpoint marked successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this mapped attendance ledger entry?')) return;

    try {
      setError(null);
      setSuccess(null);
      await attendanceApi.delete(id);
      setRecords(records.filter(r => r.id !== id));
      setSuccess('Ledger status checkpoint expunged.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  const empMap = employees.reduce((acc, e) => {
    acc[e.id] = e;
    return acc;
  }, {});

  // Fast tag layout helper
  function getBadgeClass(status) {
    switch (status) {
      case 'present': return 'badge-present';
      case 'absent': return 'badge-absent';
      case 'late': return 'badge-late';
      case 'sick_leave':
      case 'vacation': return 'badge-leave';
      default: return 'badge-neutral';
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Attendance Checkpoints</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log daily staff checkpoints and trace shift active registers</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} className="text-muted" />
            <select 
              className="input-field"
              style={{ padding: '0.5rem 2.5rem 0.5rem 1rem', width: 'auto', margin: 0, fontSize: '0.85rem' }}
              value={filterDept}
              onChange={e => { setFilterDept(e.target.value); setFilterEmpId(''); }}
            >
              <option value="">Filter by Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select 
              className="input-field"
              style={{ padding: '0.5rem 2.5rem 0.5rem 1rem', width: 'auto', margin: 0, fontSize: '0.85rem' }}
              value={filterEmpId}
              onChange={e => setFilterEmpId(e.target.value)}
            >
              <option value="">Filter by Employee ID</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>#{emp.id} - {emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Entry Register form panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} className="text-accent" style={{ color: 'var(--color-warning)' }} />
            Mark Checkpoint
          </h3>

          <form onSubmit={handleMarkAttendance}>
            <div className="input-group">
              <label className="input-label">Select Beneficiary *</label>
              <select 
                className="input-field"
                value={formData.employee_id}
                onChange={e => setFormData({...formData, employee_id: e.target.value})}
                required
              >
                <option value="">Choose employee mapping...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>#{e.id} - {e.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Checkpoint Timestamp *</label>
              <input 
                type="date"
                className="input-field"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shift Parameter Status *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                {statuses.map(st => (
                  <label 
                    key={st.id} 
                    style={{ 
                      padding: '0.6rem', 
                      background: formData.status === st.id ? 'rgba(99,102,241,0.2)' : 'rgba(10,15,30,0.6)',
                      border: `1px solid ${formData.status === st.id ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: formData.status === st.id ? 700 : 500,
                      color: formData.status === st.id ? 'white' : 'var(--text-muted)'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="status" 
                      value={st.id} 
                      checked={formData.status === st.id}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      style={{ display: 'none' }}
                    />
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: formData.status === st.id ? 'var(--color-primary)' : 'transparent' 
                    }}></span>
                    {st.label}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
              <Plus size={16} />
              {saving ? 'Transmitting Data...' : 'Submit Entry'}
            </button>
          </form>
        </div>

        {/* Ledger view panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Ledger Mappings Register</h3>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing remote FastAPI entry mappings...</div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3>No Shift Mappings Retrieved</h3>
              <p>Filter criteria delivered an empty sequence or backend database ledger uninitialized</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Entry ID</th>
                    <th>Staff Mapping</th>
                    <th>Checkpoint Date</th>
                    <th>Attendance Protocol</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const emp = empMap[rec.employee_id];
                    return (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{rec.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{emp ? emp.name : `Emp #${rec.employee_id}`}</div>
                          {emp?.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>}
                        </td>
                        <td style={{ color: 'var(--text-main)' }}>{rec.date}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(rec.status)}`}>
                            {rec.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                            onClick={() => handleDelete(rec.id)}
                            title="Purge Entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
