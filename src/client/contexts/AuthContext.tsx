import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/shared/types';
import * as authApi from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApprovedBorrower: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Last inn brukerdata fra localStorage ved oppstart
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        
        // Verifiser token ved å hente brukerdata
        authApi.getCurrentUser(savedToken)
          .then(response => {
            if (response.success && response.data) {
              setUser(response.data.user);
            } else {
              // Token ikke gyldig, logg ut
              logout();
            }
          })
          .catch(() => {
            // Feil ved verifikasjon, logg ut
            logout();
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error('Feil ved lasting av brukerdata:', error);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login(email, password);
    
    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      // Lagre i localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error(response.error?.message || 'Innlogging feilet');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const response = await authApi.register(name, email, password);
    
    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      // Lagre i localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error(response.error?.message || 'Registrering feilet');
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Send logout request til server hvis token finnes
    if (token) {
      authApi.logout(token).catch(console.error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    isApprovedBorrower: user?.isApproved === true || user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth må brukes innenfor en AuthProvider');
  }
  return context;
}