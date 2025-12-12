import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthError } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  error: AuthError | null;
  clearError: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  user_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  group_id?: number;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://veritas-t6l0.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ type: 'login', message: result.error || 'Помилка авторизації' });
        return false;
      }

      const authToken = result.token;
      localStorage.setItem('token', authToken);
      localStorage.setItem('role', result.role);
      setToken(authToken); 

      const [lastName, firstName] = result.user_name ? result.user_name.split(' ') : ['Користувач', ''];

      const userData: User = {
        id: String(result.userId || '1'),
        email: result.email,
        firstName: firstName || '',
        lastName: lastName || '',
        groupNumber: result.group_id ? String(result.group_id) : '',
        groupCode: '',
        profile: result.role === 'admin' ? 'Викладач' : 'Студент',
        role: result.role === 'admin' ? 'teacher' : 'student',
        isAuthenticated: true,
        token: authToken 
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError({ type: 'login', message: 'Помилка підключення до сервера' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!data.email.includes('@')) {
        setError({ type: 'register', message: 'Невірна адреса електронної пошти' });
        return false;
      }

      if (data.password !== data.confirmPassword) {
  setError({ type: 'register', message: 'Паролі не збігаються' });
  return false;
}

      if (data.password.length < 6) {
        setError({ type: 'register', message: 'Пароль має містити принаймні 6 символів' });
        return false;
      }

      const response = await fetch('https://veritas-t6l0.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: data.user_name,
          email: data.email,
          password: data.password,
          group_id: data.group_id,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ type: 'register', message: result.error || 'Помилка реєстрації' });
        return false;
      }

      const authToken = result.token;
      localStorage.setItem('token', authToken);
      localStorage.setItem('role', result.role);
      setToken(authToken); 

      const [lastName, firstName] = data.user_name ? data.user_name.split(' ') : ['Користувач', ''];

      const userData: User = {
        id: 'temp',
        email: data.email,
        firstName,
        lastName,
        groupNumber: String(data.group_id),
        groupCode: '',
        profile: data.role === 'admin' ? 'Викладач' : 'Студент',
        role: data.role === 'admin' ? 'teacher' : 'student',
        isAuthenticated: true,
        token: authToken
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError({ type: 'register', message: 'Помилка підключення до сервера' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null); 
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken); 
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token, 
        login,
        register,
        logout,
        error,
        clearError,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};