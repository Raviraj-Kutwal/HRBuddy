import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Plane, 
  FlaskConical, 
  Heart, 
  Briefcase, 
  Calendar, 
  RotateCcw, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Info 
} from 'lucide-react';
import { predictionApi, employeesApi, departmentsApi } from '../services/api';

export default function Prediction() {
  // Input parameters state
  const [formData, setFormData] = useState({
    OverTime: 0,
    IsLabTechnician: 0,
    Business_Travel_Frequency: 0,
    YearsAtCompany: 3,
    YearsInCurrentRole: 2,
    MaritalStatus_Single: 0,
  });

  // Supporting state
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Execution & result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Session history
  const [history, setHistory] = useState([]);

  // Presets definition
  const presets = [
    {
      name: 'High Risk Burnout',
      desc: 'Overworked single Lab Tech with frequent travel',
      data: { OverTime: 1, IsLabTechnician: 1, Business_Travel_Frequency: 1, YearsAtCompany: 2, YearsInCurrentRole: 1, MaritalStatus_Single: 1 },
    },
    {
      name: 'Stable Veteran',
      desc: 'Experienced married staff with steady role progression',
      data: { OverTime: 0, IsLabTechnician: 0, Business_Travel_Frequency: 0, YearsAtCompany: 10, YearsInCurrentRole: 7, MaritalStatus_Single: 0 },
    },
    {
      name: 'Road Warrior',
      desc: 'Staff with heavy travel schedule',
      data: { OverTime: 0, IsLabTechnician: 0, Business_Travel_Frequency: 1, YearsAtCompany: 4, YearsInCurrentRole: 2, MaritalStatus_Single: 1 },
    },
    {
      name: 'Lab Tech Overtime',
      desc: 'Lab tech working overtime with balanced travel',
      data: { OverTime: 1, IsLabTechnician: 1, Business_Travel_Frequency: 0, YearsAtCompany: 3, YearsInCurrentRole: 2, MaritalStatus_Single: 0 },
    },
  ];

  useEffect(() => {
    loadEmployeesAndDepartments();
  }, []);

  async function loadEmployeesAndDepartments() {
    try {
      const [empList, deptList] = await Promise.all([
        employeesApi.getAll().catch(() => []),
        departmentsApi.getAll().catch(() => []),
      ]);
      setEmployees(empList);
      const deptMap = {};
      deptList.forEach(d => { deptMap[d.id] = d.name; });
      setDepartments(deptMap);
    } catch {
      // Non-critical, roster selection is optional
    }
  }

  function handlePresetSelect(preset) {
    setFormData({ ...preset.data });
    setSelectedEmployeeId('');
    setError(null);
  }

  function handleEmployeeSelect(e) {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);
    if (!empId) return;

    const emp = employees.find(item => item.id === Number(empId));
    if (emp) {
      const deptName = departments[emp.department_id] || '';
      const isLab = deptName.toLowerCase().includes('lab') || deptName.toLowerCase().includes('research') ? 1 : 0;
      setFormData(prev => ({
        ...prev,
        IsLabTechnician: isLab,
      }));
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Keep YearsInCurrentRole <= YearsAtCompany
      if (field === 'YearsAtCompany' && updated.YearsInCurrentRole > value) {
        updated.YearsInCurrentRole = value;
      }
      return updated;
    });
    setSelectedEmployeeId('');
  }

  async function handlePredict(e) {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        OverTime: Number(formData.OverTime),
        IsLabTechnician: Number(formData.IsLabTechnician),
        Business_Travel_Frequency: Number(formData.Business_Travel_Frequency),
        YearsAtCompany: Number(formData.YearsAtCompany),
        YearsInCurrentRole: Number(formData.YearsInCurrentRole),
        MaritalStatus_Single: Number(formData.MaritalStatus_Single),
      };

      const response = await predictionApi.predict(payload);
      
      const prob = Number(response['Probability of Attrition'] ?? (response.risk_percentage ? response.risk_percentage / 100 : 0));
      const percentage = Math.round(prob * 100);
      const isAttrition = response.Prediction === true;
      const riskLevel = response.risk_level || (prob >= 0.6 ? 'High' : prob >= 0.35 ? 'Moderate' : 'Low');

      const fullResult = {
        ...response,
        probability: prob,
        percentage,
        isAttrition,
        riskLevel,
        inputs: { ...payload },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        employeeName: selectedEmployeeId ? employees.find(emp => emp.id === Number(selectedEmployeeId))?.name : null,
      };

      setResult(fullResult);
      setHistory(prev => [fullResult, ...prev.slice(0, 7)]);
    } catch (err) {
      setError(err.message || 'Failed to calculate attrition risk.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFormData({
      OverTime: 0,
      IsLabTechnician: 0,
      Business_Travel_Frequency: 0,
      YearsAtCompany: 3,
      YearsInCurrentRole: 2,
      MaritalStatus_Single: 0,
    });
    setSelectedEmployeeId('');
    setResult(null);
    setError(null);
  }

  // Determine dynamic accent color based on probability
  const riskColor = !result ? 'var(--color-primary)' :
    result.riskLevel === 'High' ? '#ef4444' :
    result.riskLevel === 'Moderate' ? '#f59e0b' : '#10b981';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* View Header */}
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-gradient">ML Attrition Risk Predictor</span>
            <span className="badge badge-present" style={{ fontSize: '0.7rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
              Model Online
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Logistic Regression inference engine analyzing tenure, workload, and workplace factors to forecast turnover risk.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.15)', borderLeft: '4px solid #ef4444', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Archetype Presets */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} className="text-accent" />
            Quick Test Archetypes:
          </span>
          {employees.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="input-field" 
                style={{ padding: '0.4rem 1.8rem 0.4rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
                value={selectedEmployeeId}
                onChange={handleEmployeeSelect}
              >
                <option value="">Load from Employee Roster...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    #{emp.id} - {emp.name} ({departments[emp.department_id] || 'Dept'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary"
              onClick={() => handlePresetSelect(preset)}
              style={{ 
                textAlign: 'left', 
                padding: '0.65rem 0.9rem', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                gap: '0.2rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{preset.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Input Form Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Briefcase size={18} className="text-accent" />
              Employee Indicators
            </h3>
            <button 
              type="button" 
              onClick={handleReset}
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
              title="Reset parameters"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>

          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Work Demand: OverTime */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} /> Overtime Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${formData.OverTime === 0 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('OverTime', 0)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Standard Hours
                </button>
                <button
                  type="button"
                  className={`btn ${formData.OverTime === 1 ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('OverTime', 1)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Works Overtime
                </button>
              </div>
            </div>

            {/* Travel Frequency */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plane size={14} /> Business Travel Frequency
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${formData.Business_Travel_Frequency === 0 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('Business_Travel_Frequency', 0)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Rare / Non-Travel
                </button>
                <button
                  type="button"
                  className={`btn ${formData.Business_Travel_Frequency === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('Business_Travel_Frequency', 1)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Travels Frequently
                </button>
              </div>
            </div>

            {/* Role: Lab Technician */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FlaskConical size={14} /> Job Classification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${formData.IsLabTechnician === 0 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('IsLabTechnician', 0)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  General Staff / Other
                </button>
                <button
                  type="button"
                  className={`btn ${formData.IsLabTechnician === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('IsLabTechnician', 1)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Lab Technician
                </button>
              </div>
            </div>

            {/* Marital Status */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} /> Marital Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${formData.MaritalStatus_Single === 0 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('MaritalStatus_Single', 0)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Married / Divorced
                </button>
                <button
                  type="button"
                  className={`btn ${formData.MaritalStatus_Single === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleInputChange('MaritalStatus_Single', 1)}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Single
                </button>
              </div>
            </div>

            {/* Years At Company Slider */}
            <div className="input-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  <Calendar size={14} /> Years At Company
                </label>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                  {formData.YearsAtCompany} {formData.YearsAtCompany === 1 ? 'year' : 'years'}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="40"
                value={formData.YearsAtCompany}
                onChange={(e) => handleInputChange('YearsAtCompany', Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 yrs (New)</span>
                <span>20 yrs</span>
                <span>40 yrs (Tenured)</span>
              </div>
            </div>

            {/* Years In Current Role Slider */}
            <div className="input-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  <Briefcase size={14} /> Years In Current Role
                </label>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#a855f7' }}>
                  {formData.YearsInCurrentRole} {formData.YearsInCurrentRole === 1 ? 'year' : 'years'}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max={Math.max(1, formData.YearsAtCompany)}
                value={formData.YearsInCurrentRole}
                onChange={(e) => handleInputChange('YearsInCurrentRole', Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem', accentColor: '#a855f7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 yrs (Recent Shift)</span>
                <span>Max: {formData.YearsAtCompany} yrs</span>
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem', boxShadow: 'var(--shadow-glow)' }}
              disabled={loading}
            >
              <BrainCircuit size={18} />
              {loading ? 'Evaluating Model Inference...' : 'Calculate Attrition Risk'}
            </button>
          </form>
        </div>

        {/* Right Column: Predictive Results & Diagnostic Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Result Card */}
          <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* Subtle background glow matching risk */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: riskColor,
              opacity: 0.12,
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} />

            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} className="text-accent" />
              Attrition Risk Intelligence
            </h3>

            {!result ? (
              /* Instructional Empty State */
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <BrainCircuit size={48} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '1rem', animation: 'pulseGlow 3s infinite' }} />
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Awaiting Factor Input</h4>
                <p style={{ fontSize: '0.9rem', maxWidth: '340px', margin: '0 auto', lineHeight: 1.5 }}>
                  Configure the employee indicators or pick an archetype above, then click <strong>Calculate Attrition Risk</strong> to run inference.
                </p>
              </div>
            ) : (
              /* Active Result Display */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* Visual Gauge + Headline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  
                  {/* Gauge Circle */}
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: `conic-gradient(${riskColor} ${result.percentage * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 25px ${riskColor}33`,
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      background: 'var(--bg-base)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                        {result.percentage}%
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                        Probability
                      </span>
                    </div>
                  </div>

                  {/* Summary Verdict Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className={`badge ${result.riskLevel === 'High' ? 'badge-absent' : result.riskLevel === 'Moderate' ? 'badge-late' : 'badge-present'}`}>
                        {result.riskLevel === 'High' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                        {result.riskLevel} Risk Level
                      </span>
                      {result.employeeName && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-accent)' }}>
                          • {result.employeeName}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                      {result.isAttrition ? 'High Likelihood of Attrition' : 'Likely to Retain Employee'}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {result.isAttrition 
                        ? 'Model signals elevated probability that employee may leave within the next cycle if stressors are not mitigated.'
                        : 'Key retention drivers are favorable. Employee profile demonstrates high organizational stability.'}
                    </p>
                  </div>
                </div>

                {/* Driving Factor Breakdown */}
                <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    Key Factor Contributions:
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {/* Overtime factor */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <Clock size={13} /> Overtime Demand:
                      </span>
                      <span style={{ fontWeight: 600, color: result.inputs.OverTime ? '#ef4444' : '#10b981' }}>
                        {result.inputs.OverTime ? '+ High Risk (+0.74 weight)' : '✓ Neutral (No overtime)'}
                      </span>
                    </div>

                    {/* Travel factor */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <Plane size={13} /> Frequent Travel:
                      </span>
                      <span style={{ fontWeight: 600, color: result.inputs.Business_Travel_Frequency ? '#f59e0b' : '#10b981' }}>
                        {result.inputs.Business_Travel_Frequency ? '+ Elevated (+0.29 weight)' : '✓ Low impact'}
                      </span>
                    </div>

                    {/* Role classification */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <FlaskConical size={13} /> Job Designation:
                      </span>
                      <span style={{ fontWeight: 600, color: result.inputs.IsLabTechnician ? '#f59e0b' : '#10b981' }}>
                        {result.inputs.IsLabTechnician ? '+ Lab Tech (+0.28 weight)' : '✓ General Staff'}
                      </span>
                    </div>

                    {/* Role Tenure ratio */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <Briefcase size={13} /> Role Tenure Stabilizer:
                      </span>
                      <span style={{ fontWeight: 600, color: result.inputs.YearsInCurrentRole >= 3 ? '#10b981' : '#f59e0b' }}>
                        {result.inputs.YearsInCurrentRole >= 3 ? `✓ Stabilized (-0.57 × ${result.inputs.YearsInCurrentRole} yrs)` : '⚠ Early role period'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prescriptive HR Retention Recommendations */}
                <div style={{ 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: result.riskLevel === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${result.riskLevel === 'High' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: 700, 
                    fontSize: '0.85rem',
                    color: result.riskLevel === 'High' ? '#fca5a5' : '#6ee7b7',
                    marginBottom: '0.5rem'
                  }}>
                    <Info size={15} />
                    Recommended Retention Protocol:
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {result.inputs.OverTime === 1 && (
                      <li>Cap compulsory overtime sprints and evaluate peer workload re-allocation.</li>
                    )}
                    {result.inputs.Business_Travel_Frequency === 1 && (
                      <li>Implement alternating travel rotations or provide recovery remote work days.</li>
                    )}
                    {result.inputs.IsLabTechnician === 1 && (
                      <li>Review specialized laboratory compensation benchmarks and technical certifications.</li>
                    )}
                    {result.inputs.YearsInCurrentRole >= 4 && (
                      <li>Explore internal promotion pathways or lateral growth to combat role stagnation.</li>
                    )}
                    {result.riskLevel === 'Low' && (
                      <li>Maintain regular quarterly check-ins and acknowledge consistent tenure milestones.</li>
                    )}
                  </ul>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Audit History Table */}
      {history.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Clock size={18} className="text-accent" />
              Session Inference History
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setHistory([])}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Clear Log
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Target / Preset</th>
                  <th>Overtime</th>
                  <th>Travel</th>
                  <th>Lab Tech</th>
                  <th>Tenure / Role</th>
                  <th>Status</th>
                  <th>Attrition Risk</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.timestamp}</td>
                    <td style={{ fontWeight: 600 }}>{item.employeeName || `Profile #${history.length - idx}`}</td>
                    <td>{item.inputs.OverTime ? 'Yes' : 'No'}</td>
                    <td>{item.inputs.Business_Travel_Frequency ? 'Frequent' : 'Rare'}</td>
                    <td>{item.inputs.IsLabTechnician ? 'Yes' : 'No'}</td>
                    <td>{item.inputs.YearsAtCompany}y / {item.inputs.YearsInCurrentRole}y</td>
                    <td>{item.inputs.MaritalStatus_Single ? 'Single' : 'Other'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '45px', 
                          height: '6px', 
                          borderRadius: '3px', 
                          background: 'rgba(255,255,255,0.1)',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${item.percentage}%`, 
                            height: '100%', 
                            background: item.riskLevel === 'High' ? '#ef4444' : item.riskLevel === 'Moderate' ? '#f59e0b' : '#10b981'
                          }} />
                        </div>
                        <span style={{ fontWeight: 700 }}>{item.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.riskLevel === 'High' ? 'badge-absent' : item.riskLevel === 'Moderate' ? 'badge-late' : 'badge-present'}`}>
                        {item.riskLevel} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
