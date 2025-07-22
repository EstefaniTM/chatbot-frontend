import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [logoutReason, setLogoutReason] = useState('');

  // Guardar el id en localStorage cuando se autentica
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem('userId', String(user.id));
    }
  }, [user]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Inicializar token desde localStorage si existe
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const logout = useCallback((reason = '') => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLogoutReason(''); // Elimina el mensaje de sesión finalizada
    // Remover token y userId de axios y de localStorage
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Llamar al backend para obtener el usuario actual
        const response = await axios.get('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          logout();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, token]);


  useEffect(() => {
    checkAuthStatus();
    // Interceptor para manejar errores 401/403 globalmente
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    // Limpiar el interceptor al desmontar
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [checkAuthStatus, logout]);

  const login = async (authData, formData = {}) => {
    let newToken = null;
    if (authData.token) {
      newToken = authData.token;
    } else if (authData.data && authData.data.access_token) {
      newToken = authData.data.access_token;
    }
    if (!newToken) {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      sessionStorage.removeItem('token');
      return;
    }
    setToken(newToken);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // Esperar a que el token se actualice antes de consultar el backend
    setTimeout(async () => {
      try {
        const response = await axios.get('https://nestjs-chatbot-backeb-api.desarrollo-software.xyz/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }, 0);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    token,
    logoutReason,
  };

  return (
    <AuthContext.Provider value={value}>
      {logoutReason && (
        <div style={{ color: 'red', textAlign: 'center', margin: '16px 0' }}>
          {logoutReason}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
