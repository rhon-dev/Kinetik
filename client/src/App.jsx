import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './lib/api';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Connecting to server...</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Kinetik</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Continuous movement, career momentum.
        </p>

        {health ? (
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#e8f5e9',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: 0, color: '#2e7d32' }}>
              ✓ Server connected: {health.service}
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#555' }}>
              {health.timestamp}
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#ffebee',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: 0, color: '#c62828' }}>✗ Server connection failed</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#555' }}>
              Make sure the API server is running on http://localhost:5000
            </p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2>Setup Complete ✓</h2>
          <p>Phase 0 scaffolding is ready. Next phases will add:</p>
          <ul>
            <li>Phase 1: Authentication (signup, login, JWT)</li>
            <li>Phase 2: Onboarding wizard</li>
            <li>Phase 3: Time tracking & dashboard</li>
            <li>Phase 4: Quick-entry diary</li>
            <li>Phase 5: Report generation (DOCX/PDF)</li>
            <li>Phase 6: Settings</li>
            <li>Phase 7: Production hardening</li>
          </ul>
        </div>
      </div>
    </Router>
  );
}

export default App;
