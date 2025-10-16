'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'auth au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          console.log('🔑 [AuthProvider] Token trouvé, récupération du profil...');
          setToken(storedToken);
          
          // Récupérer le profil utilisateur
          const response = await fetch('http://localhost:3001/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            console.log('✅ [AuthProvider] Utilisateur connecté:', userData.email);
          } else {
            console.log('❌ [AuthProvider] Token invalide, déconnexion...');
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } else {
          console.log('ℹ️ [AuthProvider] Aucun token trouvé');
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Erreur lors de l\'initialisation:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔑 [AuthProvider] Tentative de connexion pour:', email);
      setIsLoading(true);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ [AuthProvider] Connexion réussie:', data.user.email);
        
        // Stocker le token
        localStorage.setItem('auth_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        
        return { success: true };
      } else {
        console.log('❌ [AuthProvider] Erreur de connexion:', data.message);
        return { success: false, error: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('❌ [AuthProvider] Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 [AuthProvider] Déconnexion...');
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('👤 [AuthProvider] Mise à jour du profil:', data);
      
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const userData = await response.json();

      if (response.ok) {
        console.log('✅ [AuthProvider] Profil mis à jour:', userData.email);
        setUser(userData);
        return { success: true };
      } else {
        console.log('❌ [AuthProvider] Erreur de mise à jour:', userData.message);
        return { success: false, error: userData.message || 'Erreur de mise à jour' };
      }
    } catch (error) {
      console.error('❌ [AuthProvider] Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};