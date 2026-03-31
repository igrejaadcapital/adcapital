import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://api.adcapitaligreja.com.br/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
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
        setToken(data.access);
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

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, error, carregando }}>
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
