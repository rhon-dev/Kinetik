import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwSuccess('Password changed successfully');
      setPwForm({ current: '', next: '', confirm: '' });
      setShowChangePassword(false);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginBottom: '1rem',
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  };

  const labelStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.25rem',
  };

  const valueStyle = {
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: 500,
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
    marginBottom: '1rem',
  };

  return (
    <Layout>
      <div style={{ padding: '1.5rem 1.25rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.25rem' }}>
            Settings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Account info */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            Account
          </h2>
          <div style={{ ...itemStyle, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <div style={labelStyle}>Full Name</div>
              <div style={valueStyle}>{user?.fullName}</div>
            </div>
          </div>
          <div style={{ ...itemStyle, borderBottom: 'none', paddingBottom: 0 }}>
            <div>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
            Profile
          </h2>
          <button
            onClick={() => navigate('/setup')}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span>Edit Internship Profile</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
          </button>

          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Change Password</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{showChangePassword ? '∧' : '›'}</span>
          </button>

          {/* Change password form */}
          {showChangePassword && (
            <form onSubmit={handleChangePassword} style={{ marginTop: '1rem' }}>
              {pwError && (
                <div style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#ff8a80', padding: '0.875rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', color: '#80e27e', padding: '0.875rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {pwSuccess}
                </div>
              )}
              <input type="password" placeholder="Current password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required style={inputStyle} />
              <input type="password" placeholder="New password (min. 8 chars)" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} required style={inputStyle} />
              <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required style={{ ...inputStyle, marginBottom: 0 }} />
              <button
                type="submit"
                disabled={pwLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #cddc39 0%, #d4e157 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#0a3d3d',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  opacity: pwLoading ? 0.6 : 1,
                  marginTop: '1rem',
                }}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div style={{ ...sectionStyle, borderColor: 'rgba(244,67,54,0.2)' }}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(244,67,54,0.7)', marginBottom: '1rem' }}>
            Session
          </h2>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'rgba(244,67,54,0.1)',
              border: '1px solid rgba(244,67,54,0.25)',
              borderRadius: '12px',
              color: '#ff8a80',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
