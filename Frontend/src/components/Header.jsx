import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';

export default function Header({ title }) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="header-top glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          <Sparkles size={18} className="text-accent animate-pulse" style={{ color: 'var(--text-accent)' }} />
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {today}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Sleek Search Mockup */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search portal..." 
            className="input-field"
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', width: '220px', margin: 0 }}
            disabled
          />
        </div>

        {/* Action Icon */}
        <button 
          className="btn-secondary" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-full)', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)'
          }}
          title="Notifications"
        >
          <Bell size={18} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* User Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--gradient-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1rem',
            boxShadow: '0 2px 10px rgba(14,165,233,0.3)'
          }}>
            RK
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Raviraj Kutwal</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-accent)', fontWeight: 500 }}>HR Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
