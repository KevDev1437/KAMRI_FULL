import { createContext, ReactNode, useContext, useState } from 'react';
import { apiClient, User } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Nettoyer l'état d'authentification
  const clearAuthState = () => {
    console.log('🧹 [AUTH-MOBILE] Nettoyage de l\'état d\'authentification');
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
    apiClient.clearToken();
  };

  const login = async (email: string): Promise<boolean> => {
    if (loading) {
      console.log('⏳ [AUTH-MOBILE] Connexion déjà en cours, ignorer la demande');
      return false;
    }

    try {
      console.log('🔐 [AUTH-MOBILE] Tentative de connexion avec:', email);
      setLoading(true);
      
      // Essayer d'abord la connexion
      const loginResponse = await apiClient.login(email);
      
      if (loginResponse.data && loginResponse.data.user) {
        console.log('✅ [AUTH-MOBILE] Connexion réussie:', loginResponse.data.user);
        setIsAuthenticated(true);
        setUser(loginResponse.data.user);
        return true;
      } else {
        // Si la connexion échoue, essayer l'inscription
        console.log('📝 [AUTH-MOBILE] Connexion échouée, tentative d\'inscription');
        const registerResponse = await apiClient.register(email);
        
        if (registerResponse.data && registerResponse.data.user) {
          console.log('✅ [AUTH-MOBILE] Inscription réussie:', registerResponse.data.user);
          setIsAuthenticated(true);
          setUser(registerResponse.data.user);
          return true;
        } else {
          console.error('❌ [AUTH-MOBILE] Échec de l\'inscription:', registerResponse.error);
          return false;
        }
      }
    } catch (error) {
      console.error('❌ [AUTH-MOBILE] Erreur lors de l\'authentification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 [AUTH-MOBILE] Déconnexion');
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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