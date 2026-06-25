import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function Downloads() {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [previousHours, setPreviousHours] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [format, setFormat] = useState('docx');
  const [loading, setLoading] = useState(false);

  const isValid = periodStart && periodEnd;

  const handleExport = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await api.post(
        '/reports/weekly',
        { periodStart, periodEnd, previousAccumulatedHours: previousHours, remarks, format },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kinetik_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.error || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '14px',
    color: '#ffffff',
    fontSize: '1rem',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.625rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
    fontSize: '0.875rem',
  };

  return (
    <Layout>
      <div style={{ padding: '1.5rem 1.25rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.25rem' }}>
            Reports
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
            Generate and download your work reports
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '1.75rem',
          }}
        >
          {/* Date range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Period Start</label>
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Period End</label>
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Previous hours */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Previous Accumulated Hours</label>
            <input
              type="number"
              value={previousHours}
              min={0}
              step={0.5}
              onChange={(e) => setPreviousHours(parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Any notes for this period..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Format toggle */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Export Format</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['docx', 'pdf'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    border: `1.5px solid ${format === f ? '#d4e157' : 'rgba(255,255,255,0.2)'}`,
                    background: format === f ? 'rgba(212,225,87,0.15)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    color: format === f ? '#d4e157' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {f === 'docx' ? '📄 DOCX' : '📕 PDF'}
                </button>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={loading || !isValid}
            style={{
              width: '100%',
              padding: '1.125rem',
              background: isValid
                ? 'linear-gradient(135deg, #cddc39 0%, #d4e157 100%)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '14px',
              color: isValid ? '#0a3d3d' : 'rgba(255,255,255,0.4)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed',
              boxShadow: isValid ? '0 4px 16px rgba(212,225,87,0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Generating...' : `Export ${format.toUpperCase()}`}
          </button>

          {!isValid && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
              Select start and end dates to enable export
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
