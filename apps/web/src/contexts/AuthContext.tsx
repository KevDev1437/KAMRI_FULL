'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  memberSince?: string;
  lastUpdated?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  availableUsers: User[];
  loadAvailableUsers: () => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const loadAvailableUsers = async () => {
    try {
      console.log('🔄 [AuthContext] Chargement des utilisateurs disponibles...');
      const response = await fetch('http://localhost:3001/api/auth-test/users');
      const data = await response.json();
      
      if (data.success) {
        setAvailableUsers(data.users);
        console.log('✅ [AuthContext] Utilisateurs chargés:', data.users.length);
      } else {
        console.error('❌ [AuthContext] Erreur:', data.message);
      }
    } catch (error) {
      console.error('💥 [AuthContext] Erreur lors du chargement:', error);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔄 [AuthContext] Tentative de connexion avec:', email);
      
      const response = await fetch('http://localhost:3001/api/auth-test/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ [AuthContext] Connexion réussie:', data.user.name);
        return { success: true, message: data.message };
      } else {
        console.error('❌ [AuthContext] Échec de la connexion:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('💥 [AuthContext] Erreur lors de la connexion:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🔄 [AuthContext] Chargement du profil utilisateur:', userId);
      const response = await fetch(`http://localhost:3001/api/user-profile/${userId}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(prevUser => ({
          ...prevUser,
          ...data.user
        }));
        console.log('✅ [AuthContext] Profil utilisateur chargé:', data.user.name);
      } else {
        console.error('❌ [AuthContext] Erreur lors du chargement du profil:', data.message);
      }
    } catch (error) {
      console.error('💥 [AuthContext] Erreur lors du chargement du profil:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    console.log('👋 [AuthContext] Déconnexion');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      availableUsers, 
      loadAvailableUsers,
      loadUserProfile
    }}>
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
