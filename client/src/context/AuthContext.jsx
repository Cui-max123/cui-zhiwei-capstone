import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, getStoredUser, setSession, clearSession } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const handleUnauthorized = () => {
      clearSession();
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const validate = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/users/me', { auth: true });
        if (active) {
          setUser(res.data);
          setSession(getToken(), res.data);
        }
      } catch {
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    };
    validate();

    return () => {
      active = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/users/login', { email, password }, { auth: false });
    setSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/users/register', { username, email, password }, { auth: false });
    setSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
