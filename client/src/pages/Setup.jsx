import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import '../styles/setup.css';

const TARGET_HOURS_OPTIONS = [240, 300, 480, 600];

export default function Setup() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const toggleWeekday = (day) => {
    const newDays = profile.weeklyWorkDays.includes(day)
      ? profile.weeklyWorkDays.filter((d) => d !== day)
      : [...profile.weeklyWorkDays, day];
    setProfile({ ...profile, weeklyWorkDays: newDays.sort() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put('/profile', {
        ...profile,
        onboardingComplete: true,
      });
      completeOnboarding();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Welcome to Kinetik</h1>
        <p>Set up your internship profile to get started.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>School</label>
            <input
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Position/Designation</label>
            <input
              value={profile.position}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Assigned Office</label>
            <input
              value={profile.assignedOffice}
              onChange={(e) => setProfile({ ...profile, assignedOffice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Course/Year</label>
            <input
              value={profile.courseYear}
              onChange={(e) => setProfile({ ...profile, courseYear: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Supervisor Name</label>
            <input
              value={profile.supervisorName}
              onChange={(e) => setProfile({ ...profile, supervisorName: e.target.value })}
            />
          </div>

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
            <label>Hours Per Day (Default: {profile.hoursPerDayDefault}h)</label>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={profile.hoursPerDayDefault}
              onChange={(e) => setProfile({ ...profile, hoursPerDayDefault: parseFloat(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Work Days</label>
            <div className="chip-group">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const dayNum = idx === 6 ? 0 : idx + 1;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    className={profile.weeklyWorkDays.includes(dayNum) ? 'chip active' : 'chip'}
                    onClick={() => toggleWeekday(dayNum)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
