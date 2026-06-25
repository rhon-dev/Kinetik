import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import '../styles/dashboard.css';

const CIRCUMFERENCE = 2 * Math.PI * 52; // radius 52

function ProgressRing({ percent }) {
  const filled = (Math.min(percent, 100) / 100) * CIRCUMFERENCE;
  return (
    <div className="progress-ring-container" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" className="ring-svg">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cddc39" />
            <stop offset="100%" stopColor="#d4e157" />
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r="52"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="progress-center">
        <div className="progress-percent">{percent.toFixed(0)}%</div>
        <div className="progress-label">done</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursLogged: 8,
    note: '',
  });

  const fetchData = async () => {
    try {
      const [sumRes, logsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/timelogs'),
      ]);
      setSummary(sumRes.data.summary);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timelogs', newLog);
      setShowModal(false);
      setNewLog({ date: new Date().toISOString().split('T')[0], hoursLogged: 8, note: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add log');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Loading...</div>
        </div>
      </Layout>
    );
  }

  const percent = summary?.percentComplete ?? 0;

  return (
    <Layout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.fullName?.split(' ')[0]}</p>
        </div>

        <div className="stats-grid">
          {/* Hero progress card */}
          <div className="stat-card-hero">
            <ProgressRing percent={percent} />
            <div className="hero-info">
              <h3>Total Progress</h3>
              <div className="big-number">
                {summary?.totalHours ?? 0}
                <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
                  h
                </span>
              </div>
              <div className="hero-sub">of {summary?.targetHours ?? 0}h target</div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="stat-card">
            <h3>Days Logged</h3>
            <div className="stat-value">{summary?.daysLogged ?? 0}</div>
            <div className="stat-label">work days</div>
          </div>

          <div className="stat-card">
            <h3>Daily Avg</h3>
            <div className="stat-value">{(summary?.dailyAvg ?? 0).toFixed(1)}</div>
            <div className="stat-label">hours/day</div>
          </div>

          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Hours Remaining</h3>
            <div className="stat-value" style={{ color: '#d4e157' }}>
              {(summary?.hoursRemaining ?? 0).toFixed(0)}h
            </div>
            <div className="stat-label">to complete your internship</div>
          </div>
        </div>

        {/* Add button */}
        <button className="fab-btn" onClick={() => setShowModal(true)}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span>
          Log Today's Hours
        </button>

        {/* Recent logs */}
        <div className="recent-logs">
          <h2>Recent Logs</h2>
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>No hours logged yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Tap "+ Log Today's Hours" to get started.
              </p>
            </div>
          ) : (
            logs
              .slice()
              .reverse()
              .slice(0, 10)
              .map((log) => (
                <div key={log.id} className="log-item">
                  <span className="log-date">{log.date}</span>
                  <span className="log-hours">{log.hoursLogged}h</span>
                  {log.note && <span className="log-note">{log.note}</span>}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Add Log Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log Hours</h2>
            <form onSubmit={handleAddLog}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hours ({newLog.hoursLogged}h)</label>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={newLog.hoursLogged}
                  onChange={(e) =>
                    setNewLog({ ...newLog, hoursLogged: parseFloat(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    height: '8px',
                    borderRadius: '4px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                  }}
                />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <textarea
                  value={newLog.note}
                  onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                  rows={3}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
