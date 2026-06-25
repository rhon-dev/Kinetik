import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function Downloads() {
  const [periodStart, setPeriodStart]   = useState('');
  const [periodEnd,   setPeriodEnd]     = useState('');
  const [previousHours, setPreviousHours] = useState(0);
  const [remarks, setRemarks]           = useState('');
  const [format, setFormat]             = useState('docx');
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  const isValid = periodStart && periodEnd;

  const handleExport = async () => {
    if (!isValid) return;
    setLoading(true);
    setDone(false);
    try {
      const res = await api.post(
        '/reports/weekly',
        { periodStart, periodEnd, previousAccumulatedHours: Number(previousHours) || 0, remarks, format },
        { responseType: 'blob' }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `OJT_Weekly_Report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Export failed. Make sure you have logs for this period.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.title}>Weekly Report</h1>
            <p style={styles.subtitle}>OJT Weekly Report — USLT SACE format</p>
          </div>
        </div>

        {/* Info banner */}
        <div style={styles.banner}>
          <div style={styles.bannerDot} />
          <div>
            <p style={styles.bannerTitle}>What's included</p>
            <p style={styles.bannerBody}>
              Intern info · Hours rendered (previous / present / total) · Daily works & reflection · Documentation section · Remarks · Supervisor signature
            </p>
          </div>
        </div>

        {/* Period */}
        <Section label="Period Covered">
          <div style={styles.grid2}>
            <Field label="Start Date">
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={styles.input} />
            </Field>
            <Field label="End Date">
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={styles.input} />
            </Field>
          </div>
        </Section>

        {/* Hours */}
        <Section label="Hours">
          <Field label="Previous Accumulated Hours" hint="Hours carried over from prior weeks.">
            <input
              type="number"
              value={previousHours}
              min={0}
              step={1}
              onChange={(e) => setPreviousHours(e.target.value)}
              placeholder="0"
              style={styles.input}
            />
          </Field>
        </Section>

        {/* Remarks */}
        <Section label="Remarks">
          <Field label="Notes / Remarks">
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              placeholder="Any remarks for this week..."
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </Field>
        </Section>

        {/* Format */}
        <Section label="Export Format">
          <div style={styles.grid2}>
            {[
              { id: 'docx', icon: DocxIcon, label: 'DOCX', hint: 'Editable in Word' },
              { id: 'pdf',  icon: PdfIcon,  label: 'PDF',  hint: 'Print-ready'     },
            ].map(({ id, icon: Icon, label, hint }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFormat(id)}
                style={{
                  ...styles.formatBtn,
                  borderColor: format === id ? '#d4e157' : 'rgba(255,255,255,0.12)',
                  background:  format === id ? 'rgba(212,225,87,0.1)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <Icon active={format === id} />
                <span style={{ color: format === id ? '#d4e157' : '#fff', fontWeight: 600, fontSize: '0.9375rem' }}>{label}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{hint}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={loading || !isValid}
          style={{
            ...styles.exportBtn,
            background: done
              ? 'linear-gradient(135deg, #4caf50, #66bb6a)'
              : isValid
              ? 'linear-gradient(135deg, #cddc39, #d4e157)'
              : 'rgba(255,255,255,0.07)',
            color: (isValid || done) ? '#0a3d3d' : 'rgba(255,255,255,0.25)',
            cursor: isValid ? 'pointer' : 'not-allowed',
            boxShadow: isValid && !done ? '0 4px 24px rgba(212,225,87,0.25)' : 'none',
          }}
        >
          {loading ? (
            <span style={styles.exportInner}>
              <Spinner /> Generating…
            </span>
          ) : done ? (
            <span style={styles.exportInner}>
              <CheckIcon /> Downloaded
            </span>
          ) : isValid ? (
            <span style={styles.exportInner}>
              <DownloadIcon /> Download OJT_Weekly_Report.{format.toUpperCase()}
            </span>
          ) : (
            'Select a date range to export'
          )}
        </button>

      </div>
    </Layout>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={styles.section}>
      <p style={styles.sectionLabel}>{label}</p>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
      {hint && <p style={styles.hint}>{hint}</p>}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
const DocxIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4e157' : 'rgba(255,255,255,0.5)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const PdfIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4e157' : 'rgba(255,255,255,0.5)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="15" x2="9" y2="13"/>
    <path d="M8 13h2a1 1 0 0 1 0 2H8"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a3d3d',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
);

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: {
    padding: '1.5rem 1.25rem 3rem',
    maxWidth: 520,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    marginBottom: '1.5rem',
  },
  headerIcon: {
    width: 44, height: 44,
    borderRadius: 12,
    background: 'rgba(212,225,87,0.12)',
    border: '1px solid rgba(212,225,87,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#d4e157',
    flexShrink: 0,
  },
  title: {
    fontSize: '1.5rem', fontWeight: 700, color: '#fff',
    letterSpacing: '-0.02em', margin: 0,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: 2,
  },
  banner: {
    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14, padding: '1rem 1.125rem',
    marginBottom: '1.25rem',
  },
  bannerDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#d4e157', marginTop: 5, flexShrink: 0,
  },
  bannerTitle: {
    color: '#d4e157', fontWeight: 600, fontSize: '0.875rem', marginBottom: 3,
  },
  bannerBody: {
    color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', lineHeight: 1.6,
  },
  section: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 16, padding: '1.25rem',
    marginBottom: '0.875rem',
  },
  sectionLabel: {
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
    marginBottom: '1rem',
  },
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
  },
  fieldLabel: {
    display: 'block', marginBottom: '0.4rem',
    color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: '0.875rem',
  },
  input: {
    width: '100%', padding: '0.75rem 0.875rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff',
    fontSize: '0.9375rem', boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
  },
  hint: {
    color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '0.4rem',
  },
  formatBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '0.375rem', padding: '1rem 0.75rem',
    border: '1.5px solid', borderRadius: 12,
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  exportBtn: {
    width: '100%', padding: '1rem',
    border: 'none', borderRadius: 14,
    fontSize: '0.9375rem', fontWeight: 700,
    transition: 'all 0.2s ease',
    letterSpacing: '0.01em',
    marginTop: '0.5rem',
  },
  exportInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
};
