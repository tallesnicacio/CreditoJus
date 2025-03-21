import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

// Criando o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor de autenticação que encapsula a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await authService.getProfile();
        setUser(response.usuario);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        
        // Se o token estiver inválido, remover do localStorage
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        
        setError('Falha ao verificar autenticação. Por favor, faça login novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função para login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, senha);
      
      // Armazenar token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      
      setUser(response.usuario);
      setIsAuthenticated(true);
      
      return response.usuario;
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.error || 'Falha ao fazer login. Verifique suas credenciais.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para registro
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      // Armazenar token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      
      setUser(response.usuario);
      setIsAuthenticated(true);
      
      return response.usuario;
    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.response?.data?.error || 'Falha ao registrar. Verifique os dados informados.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Função para atualizar dados do perfil
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      
      // Atualizar os dados do usuário
      localStorage.setItem('user', JSON.stringify(response.usuario));
      setUser(response.usuario);
      
      return response.usuario;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.error || 'Falha ao atualizar perfil. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para recuperar senha
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      console.error('Erro ao solicitar recuperação de senha:', err);
      setError(err.response?.data?.error || 'Falha ao solicitar recuperação de senha. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir senha
  const resetPassword = async (token, novaSenha) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(token, novaSenha);
      return response;
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.response?.data?.error || 'Falha ao redefinir senha. Verifique o token e tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Valores e funções disponibilizados pelo contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};