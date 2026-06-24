import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { departmentsApi } from '../services/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await departmentsApi.getAll();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);
      const newDept = await departmentsApi.create(newDeptName.trim());
      setDepartments([...departments, newDept]);
      setNewDeptName('');
      setSuccess('Department added successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this department? Employees mapped to it will trigger a foreign key block.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await departmentsApi.delete(id);
      setDepartments(departments.filter(d => d.id !== id));
      setSuccess('Department deleted successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Corporate Structure</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage department mapping and functional wings</p>
        </div>
      </div>

      {/* Notifications */}
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
        {/* Create Form Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} className="text-accent" />
            Add New Department
          </h3>
          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label className="input-label">Department Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Engineering, Human Resources"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={creating}>
              <Plus size={16} />
              {creating ? 'Registering...' : 'Submit Department'}
            </button>
          </form>
        </div>

        {/* List / Data Table Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Active Departments List</h3>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading departments schema...</div>
          ) : departments.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Building2 size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No departments currently configured.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Department Name</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{dept.id}</td>
                      <td style={{ fontWeight: 500 }}>{dept.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(dept.id)}
                          title="Delete Department"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
