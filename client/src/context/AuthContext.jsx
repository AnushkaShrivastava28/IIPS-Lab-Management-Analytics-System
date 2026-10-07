import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem('token')) api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));else setLoading(false);
  }, []);
  const login = async credentials => {
    const {
      data
    } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    loading,
    login,
    logout
  }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
