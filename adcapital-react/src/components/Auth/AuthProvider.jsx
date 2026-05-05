import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://api.adcapitaligreja.com.br/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const login = async (username, password) => {
    setCarregando(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        const userData = { role: data.role, nome: data.nome };
        localStorage.setItem('user_data', JSON.stringify(userData));
        setToken(data.access);
        setUser(userData);
        return true;
      } else {
        setError('Credenciais incorretas ou sem permissão.');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao tentar logar no servidor.');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    // Escuta mudanças no localStorage de outras abas ou do interceptor axios
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('access_token');
      if (newToken !== token) {
        setToken(newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check periódico suave para garantir que mudanças na mesma aba (interceptor) propaguem
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, error, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
