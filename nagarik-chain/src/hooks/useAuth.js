import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

/**
 * Hook to access authentication state and actions.
 * @returns {{ isAuthenticated: boolean, role: string|null, user: object|null, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
