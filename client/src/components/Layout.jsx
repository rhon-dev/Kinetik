import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="bottom-nav">
        <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-item active' : 'nav-item'}>
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/downloads" className={isActive('/downloads') ? 'nav-item active' : 'nav-item'}>
          <span className="icon">📥</span>
          <span>Downloads</span>
        </Link>
        <Link to="/diary" className={isActive('/diary') ? 'nav-item active' : 'nav-item'}>
          <span className="icon">📝</span>
          <span>Diary</span>
        </Link>
        <Link to="/settings" className={isActive('/settings') ? 'nav-item active' : 'nav-item'}>
          <span className="icon">⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>

      <div className="content">{children}</div>
    </div>
  );
}
