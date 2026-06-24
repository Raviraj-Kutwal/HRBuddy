import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  CalendarCheck,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';
import { departmentsApi, employeesApi, salariesApi, attendanceApi } from '../services/api';

export default function Dashboard({ setActiveTab }) {
  const [dataStats, setDataStats] = useState({
    departments: 0,
    employees: 0,
    totalSalary: 0,
    attendanceCount: 0,
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [deptData, empData, salData, attData] = await Promise.all([
          departmentsApi.getAll().catch(() => []),
          employeesApi.getAll().catch(() => []),
          salariesApi.getAll().catch(() => []),
          attendanceApi.getAll().catch(() => [])
        ]);

        const totalSal = salData.reduce((sum, s) => sum + (Number(s.salary) || 0), 0);
        
        setDataStats({
          departments: deptData.length,
          employees: empData.length,
          totalSalary: totalSal,
          attendanceCount: attData.length,
          recentAttendance: attData.slice(-5).reverse() // Last 5 attendance records
        });
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="empty-state animate-fade-in">
        <Activity className="animate-pulse" size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <h3>Loading System Analytics...</h3>
        <p>Crunching high-performance FastAPI backend payloads</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Value Cards */}
      <div className="stat-grid">
        {/* Metric 1 */}
        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('departments')}>
          <div className="stat-icon-wrapper stat-primary">
            <Building2 size={24} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Departments
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dataStats.departments}
            <TrendingUp size={18} style={{ color: '#34d399' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>Click to manage structure →</span>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('employees')}>
          <div className="stat-icon-wrapper stat-secondary">
            <Users size={24} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Employees
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dataStats.employees}
            <TrendingUp size={18} style={{ color: '#38bdf8' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>View complete roster →</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('salaries')}>
          <div className="stat-icon-wrapper stat-success">
            <CreditCard size={24} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Payroll Disbursed
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
            ${dataStats.totalSalary.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Logged compensation records</span>
        </div>

        {/* Metric 4 */}
        <div className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('attendance')}>
          <div className="stat-icon-wrapper stat-warning">
            <CalendarCheck size={24} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Attendance Entries
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {dataStats.attendanceCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Daily logged checkpoints</span>
        </div>
      </div>

      {/* Main Content Layout Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Quick Info Feature Graphic */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-gradient">HR Engine Capability</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Welcome to the ultimate HR assistant dashboard. Designed seamlessly on top of a highly optimized FastAPI PostgreSQL architecture, providing robust Pydantic data validation schemas and secure nested queries.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ background: 'rgba(99,102,241,0.2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', color: '#818cf8', fontWeight: 'bold' }}>ORM</span>
                <span>Fully declarative auto-syncing SQLAlchemy relations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ background: 'rgba(16,185,129,0.2)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', color: '#34d399', fontWeight: 'bold' }}>UI</span>
                <span>Glassmorphism, CSS Tokens, Micro-transitions</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Need fast data entries?</span>
            <button className="btn btn-primary" onClick={() => setActiveTab('employees')}>
              Add New Employee
            </button>
          </div>
        </div>

        {/* Live Recent Check-ins Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} className="text-accent" />
            Recent Attendance Log
          </h3>

          {dataStats.recentAttendance.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No attendance records mapped yet. Head to the Attendance tab to log entries.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dataStats.recentAttendance.map((rec) => (
                <div key={rec.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(10,15,30,0.4)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--color-primary)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Emp #{rec.employee_id} Checkpoint</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date}</div>
                  </div>
                  <span className={`badge badge-${rec.status === 'present' ? 'present' : rec.status === 'absent' ? 'absent' : rec.status === 'late' ? 'late' : 'leave'}`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
