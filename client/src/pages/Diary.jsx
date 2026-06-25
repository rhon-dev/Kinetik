import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

const CATEGORIES = ['Coding', 'Debugging', 'Meeting', 'Documentation', 'Testing', 'Research', 'Admin'];

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ date: '', category: 'Coding', detail: '', tags: [] });

  useEffect(() => {
    api.get('/diary/diary').then((res) => setEntries(res.data.entries || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/diary/diary', newEntry);
      setShowModal(false);
      setNewEntry({ date: '', category: 'Coding', detail: '', tags: [] });
      const res = await api.get('/diary/diary');
      setEntries(res.data.entries || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add entry');
    }
  };

  return (
    <Layout>
      <div style={{ padding: '1rem' }}>
        <h1>Activity Diary</h1>
        <button onClick={() => setShowModal(true)} style={{ marginBottom: '1rem' }}>
          + New Entry
        </button>

        <div>
          {entries.map((entry) => (
            <div key={entry.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{entry.date}</strong>
                <span style={{ color: '#666' }}>{entry.category}</span>
              </div>
              <p style={{ marginTop: '0.5rem' }}>{entry.composedText}</p>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>New Diary Entry</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Detail</label>
                  <textarea value={newEntry.detail} onChange={(e) => setNewEntry({ ...newEntry, detail: e.target.value })} required />
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
