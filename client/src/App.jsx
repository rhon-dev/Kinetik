import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireOnboarding } from './components/RouteGuard';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Diary from './pages/Diary';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/setup"
            element={
              <RequireAuth>
                <Setup />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireOnboarding>
                <Dashboard />
              </RequireOnboarding>
            }
          />

          <Route
            path="/diary"
            element={
              <RequireOnboarding>
                <Diary />
              </RequireOnboarding>
            }
          />

          <Route
            path="/downloads"
            element={
              <RequireOnboarding>
                <Downloads />
              </RequireOnboarding>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireOnboarding>
                <Settings />
              </RequireOnboarding>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
