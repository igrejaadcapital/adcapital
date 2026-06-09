import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../../config/apiBase';

const AuthContext = createContext();

const API_URL = getApiBaseUrl();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const bootstrapSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser({ role: data.role, nome: data.nome, username: data.username });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    // Migração Fase 6: tokens legados no localStorage não são mais usados
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    bootstrapSession();
  }, [bootstrapSession]);

  const login = async (username, password, attempt = 1) => {
    const maxAttempts = 3;
    setCarregando(true);
    if (attempt === 1) setError(null);
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ role: data.role, nome: data.nome, username });
        return true;
      }
      setError('Credenciais incorretas ou sem permissão.');
      return false;
    } catch {
      if (attempt < maxAttempts) {
        setError(`Servidor iniciando... Tentativa ${attempt}/${maxAttempts}`);
        await new Promise((r) => setTimeout(r, 5000));
        return login(username, password, attempt + 1);
      }
      setError('Erro de conexão ao tentar logar no servidor. Tente novamente em instantes.');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // limpa sessão local mesmo se a API falhar
    }
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        sessionLoading,
        login,
        logout,
        error,
        carregando,
        token: isAuthenticated ? 'cookie' : null,
      }}
    >
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
