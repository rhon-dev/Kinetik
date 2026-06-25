import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({ date: '', hoursLogged: 8, note: '' });

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
      setNewLog({ date: '', hoursLogged: 8, note: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add log');
    }
  };

  if (loading) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>

        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Progress</h3>
              <div className="progress-ring">
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="8"
                    strokeDasharray={`${(summary.percentComplete / 100) * 314} 314`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-text">{summary.percentComplete.toFixed(0)}%</div>
              </div>
            </div>

            <div className="stat-card">
              <h3>Total Hours</h3>
              <p className="stat-value">{summary.totalHours}</p>
              <p className="stat-label">of {summary.targetHours}</p>
            </div>

            <div className="stat-card">
              <h3>Days Logged</h3>
              <p className="stat-value">{summary.daysLogged}</p>
            </div>

            <div className="stat-card">
              <h3>Daily Average</h3>
              <p className="stat-value">{summary.dailyAvg.toFixed(1)}h</p>
            </div>

            <div className="stat-card">
              <h3>Remaining</h3>
              <p className="stat-value">{summary.hoursRemaining.toFixed(1)}h</p>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Add Hours
          </button>
        </div>

        <div className="recent-logs">
          <h2>Recent Logs</h2>
          {logs.slice(0, 10).map((log) => (
            <div key={log.id} className="log-item">
              <span className="log-date">{log.date}</span>
              <span className="log-hours">{log.hoursLogged}h</span>
              {log.note && <span className="log-note">{log.note}</span>}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add Hours</h2>
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
                  <label>Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newLog.hoursLogged}
                    onChange={(e) => setNewLog({ ...newLog, hoursLogged: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Note (optional)</label>
                  <textarea
                    value={newLog.note}
                    onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
