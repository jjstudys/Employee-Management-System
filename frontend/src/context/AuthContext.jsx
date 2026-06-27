import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getAccessToken, setAccessToken } from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await authAPI.getProfile({ skipAuthRefresh: true });
      setUser(data.data.user);
      setEmployee(data.data.employee);
    } catch {
      setAccessToken(null);
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5001', {
      auth: { token: getAccessToken() },
      withCredentials: true,
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, [user]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    setEmployee(data.data.employee);
    return data.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
    setEmployee(null);
    socket?.disconnect();
    setSocket(null);
  };

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin = () => user?.role === 'admin';
  const isHR = () => ['admin', 'hr'].includes(user?.role);
  const isManager = () => ['admin', 'hr', 'manager'].includes(user?.role);
  const isEmployee = () => user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{ user, employee, loading, login, logout, hasRole, isAdmin, isHR, isManager, socket, loadProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
