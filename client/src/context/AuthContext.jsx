import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      // Check onboarding
      const profileRes = await api.get('/profile');
      setOnboardingComplete(profileRes.data.profile?.onboardingComplete || false);
    } catch {
      setUser(null);
      setOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const signup = async (email, password, fullName) => {
    const res = await api.post('/auth/signup', { email, password, fullName });
    setUser(res.data.user);
    setOnboardingComplete(false);
    return res.data.user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    // Check onboarding after login
    try {
      const profileRes = await api.get('/profile');
      setOnboardingComplete(profileRes.data.profile?.onboardingComplete || false);
    } catch {
      setOnboardingComplete(false);
    }
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setOnboardingComplete(false);
  };

  const completeOnboarding = () => setOnboardingComplete(true);
  const refreshUser = fetchMe;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        onboardingComplete,
        signup,
        login,
        logout,
        completeOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
