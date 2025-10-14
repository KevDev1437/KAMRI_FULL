'use client';

import { apiClient } from '@/lib/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        // Ici on pourrait faire un appel pour vérifier le token
        // Pour l'instant, on considère que si le token existe, l'utilisateur est connecté
        setUser({
          id: '1',
          email: 'admin@kamri.com',
          name: 'Admin KAMRI',
          role: 'admin'
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    
    if (response.data) {
      setUser(response.data.user);
      return { success: true };
    } else {
      return { success: false, error: response.error };
    }
  };

  const register = async (email: string, name: string, password: string, role: string = 'admin') => {
    const response = await apiClient.register(email, name, password, role);
    
    if (response.data) {
      setUser(response.data.user);
      return { success: true };
    } else {
      return { success: false, error: response.error };
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
