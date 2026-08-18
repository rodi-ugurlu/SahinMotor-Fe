import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import type { AuthRole, LoginCredentials, User } from '../types/auth';
import { loginWithCredentials, registerSahin, registerKoman, requestPasswordReset } from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (role: AuthRole, credentials: LoginCredentials) => Promise<void>;
  registerSahinAccount: (data: Parameters<typeof registerSahin>[0]) => Promise<void>;
  registerKomanAccount: (data: Parameters<typeof registerKoman>[0]) => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (role: AuthRole, credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await loginWithCredentials(role, credentials);
      setUser(loggedInUser);
      message.success(`Hoş geldiniz, ${loggedInUser.name}`);
      navigate('/select-business');
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Giriş yapılamadı';
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const registerSahinAccount = async (data: Parameters<typeof registerSahin>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerSahin(data);
      message.success('Hesabınız oluşturuldu. Giriş yapabilirsiniz.');
      await login('sahin', { email: data.email, password: data.password });
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Kayıt olunamadı';
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const registerKomanAccount = async (data: Parameters<typeof registerKoman>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerKoman(data);
      message.success('Bayi başvurunuz alındı. Giriş yapabilirsiniz.');
      await login('koman', { email: data.email, password: data.password });
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Başvuru gönderilemedi';
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const notice = await requestPasswordReset(email);
      return notice;
    } catch (err) {

      const messageText = err instanceof Error ? err.message : 'Şifre sıfırlama talebi başarısız oldu';
      setError(messageText);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    registerSahinAccount,
    registerKomanAccount,
    resetPassword,
    clearError,
  };
}
