import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Search, Filter, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { salariesApi, employeesApi, departmentsApi } from '../services/api';

export default function Salaries() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterEmpId, setFilterEmpId] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Creation form state
  const [formData, setFormData] = useState({
    employee_id: '',
    salary: '',
    month_and_year: new Date().toISOString().split('T')[0] // default to today
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBaseContext();
  }, [filterEmpId, filterDept]);

  async function loadBaseContext() {
    try {
      setLoading(true);
      const [salData, empData, deptData] = await Promise.all([
        salariesApi.getAll(filterEmpId || null, filterDept || null),
        employeesApi.getAll().catch(() => []),
        departmentsApi.getAll().catch(() => [])
      ]);
      setSalaries(salData);
      setEmployees(empData);
      setDepartments(deptData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.employee_id || !formData.salary || !formData.month_and_year) {
      alert('Fill all parameters');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        employee_id: Number(formData.employee_id),
        salary: parseFloat(formData.salary),
        month_and_year: formData.month_and_year
      };

      const newSal = await salariesApi.create(payload);
      setSalaries([newSal, ...salaries]);
      setFormData({ ...formData, salary: '' }); // reset amount
      setSuccess('Compensation log synced successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this salary disbursement record?')) return;

    try {
      setError(null);
      setSuccess(null);
      await salariesApi.delete(id);
      setSalaries(salaries.filter(s => s.id !== id));
      setSuccess('Disbursement history record dropped.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  // Fast mapping dictionary
  const empMap = employees.reduce((acc, e) => {
    acc[e.id] = e;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Payroll Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record monthly base salary allocations and audit accounting schedules</p>
        </div>

        {/* Filter Layouts */}
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
        {/* Pay Slip entry panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} className="text-success" style={{ color: '#34d399' }} />
            Log Compensation Slip
          </h3>

          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label className="input-label">Select Beneficiary *</label>
              <select 
                className="input-field"
                value={formData.employee_id}
                onChange={e => setFormData({...formData, employee_id: e.target.value})}
                required
              >
                <option value="">Choose employee account...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>#{e.id} - {e.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Disbursed Amount ($) *</label>
              <input 
                type="number"
                step="0.01"
                className="input-field"
                placeholder="5000.00"
                value={formData.salary}
                onChange={e => setFormData({...formData, salary: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Payroll Date Cycle *</label>
              <input 
                type="date"
                className="input-field"
                value={formData.month_and_year}
                onChange={e => setFormData({...formData, month_and_year: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={saving}>
              <Plus size={16} />
              {saving ? 'Processing Allocation...' : 'Register Compensation'}
            </button>
          </form>
        </div>

        {/* Audit Schedule Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Disbursement History Logs</h3>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Querying backend salary mapping sets...</div>
          ) : salaries.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3>No Salary Allocations Present</h3>
              <p>Select target beneficiaries and disburse payroll to map history logs</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Log ID</th>
                    <th>Beneficiary Name</th>
                    <th>Compensation</th>
                    <th>Cycle Timestamp</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((sal) => {
                    const emp = empMap[sal.employee_id];
                    return (
                      <tr key={sal.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{sal.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{emp ? emp.name : `Emp #${sal.employee_id}`}</div>
                          {emp?.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>}
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399', fontSize: '1.05rem' }}>
                          ${Number(sal.salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{sal.month_and_year}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                            onClick={() => handleDelete(sal.id)}
                            title="Drop Payload"
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
