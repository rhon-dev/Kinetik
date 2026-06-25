import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

const CATEGORIES = [
  { id: 'Coding', emoji: '💻' },
  { id: 'Debugging', emoji: '🐛' },
  { id: 'Meeting', emoji: '📣' },
  { id: 'Documentation', emoji: '📄' },
  { id: 'Testing', emoji: '🧪' },
  { id: 'Research', emoji: '🔍' },
  { id: 'Admin', emoji: '📋' },
];

const CAT_COLORS = {
  Coding: '#d4e157',
  Debugging: '#81d4fa',
  Meeting: '#ce93d8',
  Documentation: '#80cbc4',
  Testing: '#ffcc02',
  Research: '#ffb74d',
  Admin: '#a5d6a7',
};

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Coding',
    detail: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const fetchEntries = () => {
    api.get('/diary/diary').then((res) => setEntries(res.data.entries || []));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/diary/diary', newEntry);
      setShowModal(false);
      setNewEntry({ date: new Date().toISOString().split('T')[0], category: 'Coding', detail: '', tags: [] });
      setTagInput('');
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add entry');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !newEntry.tags.includes(t)) {
      setNewEntry({ ...newEntry, tags: [...newEntry.tags, t] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setNewEntry({ ...newEntry, tags: newEntry.tags.filter((t) => t !== tag) });
  };

  return (
    <Layout>
      <div style={{ padding: '1.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
              Activity Diary
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, #cddc39 0%, #d4e157 100%)',
              color: '#0a3d3d',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212,225,87,0.25)',
              flexShrink: 0,
            }}
          >
            + New
          </button>
        </div>

        {/* Entry list */}
        {entries.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p>No diary entries yet.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Start logging your daily activities.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  borderLeft: `3px solid ${CAT_COLORS[entry.category] || '#d4e157'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.625rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: CAT_COLORS[entry.category] || '#d4e157',
                      background: `${CAT_COLORS[entry.category] || '#d4e157'}20`,
                      padding: '0.25rem 0.625rem',
                      borderRadius: '20px',
                    }}
                  >
                    {CATEGORIES.find((c) => c.id === entry.category)?.emoji} {entry.category}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem' }}>
                    {entry.date}
                  </span>
                </div>
                <p style={{ color: '#fff', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {entry.composedText}
                </p>
                {entry.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.6)',
                          background: 'rgba(255,255,255,0.08)',
                          padding: '0.2rem 0.625rem',
                          borderRadius: '20px',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Entry Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f4c4c 0%, #1a5c5c 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '24px 24px 12px 12px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              New Entry
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Date */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Date
                </label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category chips */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Category
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, category: cat.id })}
                      style={{
                        padding: '0.5rem 1rem',
                        border: `1.5px solid ${newEntry.category === cat.id ? CAT_COLORS[cat.id] : 'rgba(255,255,255,0.2)'}`,
                        background: newEntry.category === cat.id ? `${CAT_COLORS[cat.id]}20` : 'rgba(255,255,255,0.05)',
                        borderRadius: '24px',
                        color: newEntry.category === cat.id ? CAT_COLORS[cat.id] : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {cat.emoji} {cat.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                  What did you do?
                </label>
                <textarea
                  value={newEntry.detail}
                  onChange={(e) => setNewEntry({ ...newEntry, detail: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe your activity..."
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Tags (optional)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter"
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.9375rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
                {newEntry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.625rem' }}>
                    {newEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: 'rgba(212,225,87,0.15)',
                          color: '#d4e157',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '20px',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #cddc39 0%, #d4e157 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0a3d3d',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(212,225,87,0.25)',
                  }}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
