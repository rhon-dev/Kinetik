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

  const handleExport = async () => {
    if (!periodStart || !periodEnd) {
      alert('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        '/reports/weekly',
        {
          periodStart,
          periodEnd,
          previousAccumulatedHours: previousHours,
          remarks,
          format,
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.error || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '1rem' }}>
        <h1>Generate Report</h1>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Period Start</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={{ display: 'block', marginTop: '0.5rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Period End</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={{ display: 'block', marginTop: '0.5rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Previous Accumulated Hours</label>
            <input type="number" value={previousHours} onChange={(e) => setPreviousHours(parseFloat(e.target.value))} style={{ display: 'block', marginTop: '0.5rem' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ display: 'block', marginTop: '0.5rem', width: '100%' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ display: 'block', marginTop: '0.5rem' }}>
              <option value="docx">DOCX</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <button onClick={handleExport} disabled={loading} className="primary-btn">
            {loading ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
