import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  CalendarCheck 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'salaries', label: 'Salaries', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* App Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
          <div style={{ 
            background: 'var(--gradient-primary)', 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-sm)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            HB
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}><span className="text-gradient">HR</span>Buddy</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Premium Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="nav-links">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <div 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Info */}
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: 'var(--radius-sm)', 
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FastAPI Engine</div>
        <div style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
          System Online
        </div>
      </div>
    </aside>
  );
}
