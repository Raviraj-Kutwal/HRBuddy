import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Departments from './components/Departments';
import Employees from './components/Employees';
import Salaries from './components/Salaries';
import Attendance from './components/Attendance';
import Prediction from './components/Prediction';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Title configuration map
  const titles = {
    dashboard: 'Executive Overview',
    departments: 'Departments Architecture',
    employees: 'Staff Personnel Database',
    salaries: 'Disbursement Schedules',
    attendance: 'Attendance Logging Protocol',
    prediction: 'AI Attrition Prediction & Risk Analysis',
  };

  function renderViewContent() {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'departments':
        return <Departments />;
      case 'employees':
        return <Employees />;
      case 'salaries':
        return <Salaries />;
      case 'attendance':
        return <Attendance />;
      case 'prediction':
        return <Prediction />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  }

  return (
    <div className="app-container">
      {/* Persistent Premium Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Dynamic Workspace Area */}
      <main className="main-content">
        <Header title={titles[activeTab] || 'HR Portal'} />
        
        {/* Render Selected Functional View Component */}
        {renderViewContent()}
      </main>
    </div>
  );
}
