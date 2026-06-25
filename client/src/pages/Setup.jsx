import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import '../styles/setup.css';

const TARGET_HOURS_OPTIONS = [240, 300, 480, 600];
const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export default function Setup() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    school: '',
    company: '',
    position: '',
    assignedOffice: '',
    courseYear: '',
    supervisorName: '',
    targetHours: 480,
    startDate: '',
    hoursPerDayDefault: 8,
    weeklyWorkDays: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    api.get('/profile').then((res) => {
      if (res.data.profile) {
        const p = res.data.profile;
        setProfile({
          school: p.school || '',
          company: p.company || '',
          position: p.position || '',
          assignedOffice: p.assignedOffice || '',
          courseYear: p.courseYear || '',
          supervisorName: p.supervisorName || '',
          targetHours: p.targetHours || 480,
          startDate: p.startDate ? p.startDate.split('T')[0] : '',
          hoursPerDayDefault: p.hoursPerDayDefault || 8,
          weeklyWorkDays: p.weeklyWorkDays || [1, 2, 3, 4, 5],
        });
      }
    });
  }, []);

  const toggleDay = (val) => {
    const days = profile.weeklyWorkDays.includes(val)
      ? profile.weeklyWorkDays.filter((d) => d !== val)
      : [...profile.weeklyWorkDays, val];
    setProfile({ ...profile, weeklyWorkDays: days.sort((a, b) => a - b) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put('/profile', { ...profile, onboardingComplete: true });
      completeOnboarding();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
      setLoading(false);
    }
  };

  const sectionTitle = (text) => (
    <h3
      style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '1.25rem',
        marginTop: '1.75rem',
        paddingTop: '1.75rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {text}
    </h3>
  );

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Setup Profile</h1>
        <p>Fill in your internship details to get started.</p>

        <form onSubmit={handleSubmit}>
          {/* Internship Details */}
          {sectionTitle('Internship Details')}

          <div className="form-group">
            <label>School / University</label>
            <input
              type="text"
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              placeholder="e.g. University of the Philippines"
            />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="form-group">
            <label>Position / Designation</label>
            <input
              type="text"
              value={profile.position}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
              placeholder="e.g. Software Engineering Intern"
            />
          </div>

          <div className="form-group">
            <label>Assigned Office / Department</label>
            <input
              type="text"
              value={profile.assignedOffice}
              onChange={(e) => setProfile({ ...profile, assignedOffice: e.target.value })}
              placeholder="e.g. IT Department"
            />
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
          >
            <div className="form-group">
              <label>Course / Year</label>
              <input
                type="text"
                value={profile.courseYear}
                onChange={(e) => setProfile({ ...profile, courseYear: e.target.value })}
                placeholder="e.g. BSCS 4th Year"
              />
            </div>
            <div className="form-group">
              <label>Supervisor Name</label>
              <input
                type="text"
                value={profile.supervisorName}
                onChange={(e) => setProfile({ ...profile, supervisorName: e.target.value })}
                placeholder="e.g. Juan dela Cruz"
              />
            </div>
          </div>

          {/* Hours & Schedule */}
          {sectionTitle('Hours & Schedule')}

          <div className="form-group">
            <label>Target Hours</label>
            <div className="chip-group">
              {TARGET_HOURS_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={profile.targetHours === h ? 'chip active' : 'chip'}
                  onClick={() => setProfile({ ...profile, targetHours: h })}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={profile.startDate}
              onChange={(e) => setProfile({ ...profile, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Default Hours Per Day &mdash;{' '}
              <span style={{ color: '#d4e157', fontWeight: 600 }}>
                {profile.hoursPerDayDefault}h
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={profile.hoursPerDayDefault}
              onChange={(e) =>
                setProfile({ ...profile, hoursPerDayDefault: parseFloat(e.target.value) })
              }
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8125rem',
                marginTop: '0.375rem',
              }}
            >
              <span>1h</span>
              <span>12h</span>
            </div>
          </div>

          <div className="form-group">
            <label>Weekly Work Days</label>
            <div className="chip-group">
              {DAYS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  className={profile.weeklyWorkDays.includes(value) ? 'chip active' : 'chip'}
                  onClick={() => toggleDay(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Saving...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  );
}
