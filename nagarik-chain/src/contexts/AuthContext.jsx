import { createContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import api from '@utils/api';
import { normalizeCitizen } from '@utils/adapter';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials, loginRole) => {
    setLoading(true);
    try {
      const chin = credentials.id;

      const tokenRes = await api.post('/auth/token', { chin });
      const accessToken = tokenRes.data.access_token;
      localStorage.setItem('nagarik_token', accessToken);

      const profileRes = await api.get(`/identity/${chin}`);
      const normalized = normalizeCitizen(profileRes.data);

      const userRole = loginRole === 'admin' ? 'admin' : 'citizen';

      setUser({ ...normalized, role: userRole });
      setRole(userRole);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nagarik_token');
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, role, user, login, logout, loading }),
    [isAuthenticated, role, user, login, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
