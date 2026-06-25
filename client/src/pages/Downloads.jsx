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
        {
          periodStart,
          periodEnd,
          previousAccumulatedHours: Number(previousHours) || 0,
          remarks,
          format,
        },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OJT_Weekly_Report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.error || 'Export failed. Make sure you have logs for this period.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.9375rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
    fontSize: '0.875rem',
  };

  const section = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginBottom: '1rem',
  };

  return (
    <Layout>
      <div style={{ padding: '1.5rem 1.25rem 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Weekly Report
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
            Generates the USL OJT Weekly Report template
          </p>
        </div>

        {/* Template preview note */}
        <div
          style={{
            ...section,
            borderColor: 'rgba(212,225,87,0.2)',
            background: 'rgba(212,225,87,0.05)',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📋</span>
          <div>
            <p style={{ color: '#d4e157', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
              USLT OJT Weekly Report Format
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Report includes: intern info, hours rendered (previous/present/total), daily works attended, learning/reflection column, documentation section, remarks, and supervisor signature.
            </p>
          </div>
        </div>

        {/* Period */}
        <div style={section}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Period Covered
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div style={section}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Hours
          </p>
          <label style={labelStyle}>Previous Accumulated Hours</label>
          <input
            type="number"
            value={previousHours}
            min={0}
            step={1}
            onChange={(e) => setPreviousHours(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
            Hours from previous weeks. The report will compute: Previous + This period = Total.
          </p>
        </div>

        {/* Remarks */}
        <div style={section}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Remarks
          </p>
          <label style={labelStyle}>Remarks / Notes</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="Enter any remarks for this week..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Format */}
        <div style={section}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
            Export Format
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['docx', 'pdf'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: `1.5px solid ${format === f ? '#d4e157' : 'rgba(255,255,255,0.15)'}`,
                  background: format === f ? 'rgba(212,225,87,0.12)' : 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  color: format === f ? '#d4e157' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  transition: 'all 0.2s ease',
                }}
              >
                {f === 'docx' ? '📄 DOCX' : '📕 PDF'}
              </button>
            ))}
          </div>
          {format === 'docx' && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
              Recommended — editable in Microsoft Word, matches the exact USL template layout.
            </p>
          )}
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
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '14px',
            color: isValid ? '#0a3d3d' : 'rgba(255,255,255,0.3)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isValid ? 'pointer' : 'not-allowed',
            boxShadow: isValid ? '0 4px 20px rgba(212,225,87,0.3)' : 'none',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          {loading
            ? 'Generating...'
            : isValid
            ? `Download OJT_Weekly_Report.${format.toUpperCase()}`
            : 'Select a date range to export'}
        </button>
      </div>
    </Layout>
  );
}
