import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export function useAuth() {
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
    setToken(null);
  };

  return { token, login, logout, error, carregando };
}
