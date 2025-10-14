'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  // Validation du mot de passe
  const validatePassword = (password: string): PasswordStrength => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, text: 'Faible', color: '#EF4444' };
    if (score <= 3) return { score, text: 'Moyen', color: '#F59E0B' };
    return { score, text: 'Fort', color: '#10B981' };
  };

  const passwordStrength = validatePassword(registerData.password);
  const isPasswordValid = passwordStrength.score >= 4;
  const isFormValid = registerData.firstName && 
                     registerData.lastName && 
                     registerData.email && 
                     isPasswordValid && 
                     registerData.password === registerData.confirmPassword;

  const handleLogin = async () => {
    if (!loginData.email) {
      alert('Veuillez entrer votre email ou numéro de téléphone');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stratégie Temu : Accepter n'importe quel email et créer un utilisateur
      const email = loginData.email;
      const firstName = email.includes('@') ? email.split('@')[0] : 'Utilisateur';
      const lastName = 'KAMRI';
      
      login({ firstName, lastName, email });
      onClose();
    } catch (error) {
      alert('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isFormValid) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      login({ 
        firstName: registerData.firstName, 
        lastName: registerData.lastName, 
        email: registerData.email 
      });
      onClose();
    } catch (error) {
      alert('Une erreur est survenue lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <div className="space-y-1">
      {/* Avantages KAMRI */}
      <div className="grid grid-cols-2 gap-1 mb-2">
        <div className="flex items-center space-x-1 bg-green-50 p-1 rounded-md">
          <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xs text-green-700 font-medium">Livraison gratuite</span>
        </div>
        <div className="flex items-center space-x-1 bg-blue-50 p-1 rounded-md">
          <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-blue-700 font-medium">Qualité garantie</span>
        </div>
      </div>

      {/* Sécurité */}
      <div className="flex items-center space-x-1 mb-2">
        <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-xs text-gray-600">Données protégées</span>
      </div>

      {/* Email simple */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-0.5">E-mail ou numéro de téléphone</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
            <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            placeholder="votre@email.com ou +33 6 12 34 56 78"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
        </div>
      </div>

      {/* Bouton Continuer */}
      <button
        onClick={handleLogin}
        disabled={isLoading || !loginData.email}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded-md font-bold text-xs hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? 'Connexion...' : 'Continuer'}
      </button>

      {/* Bouton de test rapide */}
      <button
        onClick={() => setLoginData({ email: 'demo@kamri.com', password: '' })}
        className="w-full bg-gray-100 text-gray-600 py-1 rounded-md font-medium hover:bg-gray-200 transition-colors duration-300 border border-gray-300 text-xs"
      >
        🧪 Test rapide (demo@kamri.com)
      </button>

      {/* Connexion sociale */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Ou continuer avec</p>
        <div className="flex justify-center space-x-2">
          <button className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-300">
            <svg className="h-3 w-3 text-red-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-300">
            <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-300">
            <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.004-.159-3.816 1.1-4.817 1.1zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-1">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-0.5">Prénom</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              placeholder="Prénom"
              value={registerData.firstName}
              onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-0.5">Nom</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              placeholder="Nom"
              value={registerData.lastName}
              onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-0.5">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              type="email"
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              placeholder="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-0.5">Mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-6 pr-6 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              placeholder="mot de passe"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-1.5 flex items-center"
            >
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
        
      {/* Indicateur de force du mot de passe */}
      {registerData.password.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Force du mot de passe</span>
            <span className={`text-xs font-semibold`} style={{ color: passwordStrength.color }}>
              {passwordStrength.text}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(passwordStrength.score / 5) * 100}%`,
                backgroundColor: passwordStrength.color
              }}
            />
          </div>
        </div>
      )}

      {/* Critères de validation */}
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
        <div className="flex items-center space-x-1">
          <svg className={`h-2.5 w-2.5 ${registerData.password.length >= 8 ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">8+ caractères</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className={`h-2.5 w-2.5 ${/[A-Z]/.test(registerData.password) ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Majuscule</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className={`h-2.5 w-2.5 ${/\d/.test(registerData.password) ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Chiffre</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className={`h-2.5 w-2.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(registerData.password) ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Spécial</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-0.5">Confirmer le mot de passe</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
            <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full pl-6 pr-6 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            placeholder="confirmer"
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-1.5 flex items-center"
          >
            <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showConfirmPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Validation de confirmation */}
        {registerData.confirmPassword.length > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <svg className={`h-4 w-4 ${registerData.password === registerData.confirmPassword ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className={`text-sm font-medium ${registerData.password === registerData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {registerData.password === registerData.confirmPassword ? 'Mots de passe identiques' : 'Mots de passe différents'}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded-md font-bold text-xs hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[220px]">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-sm font-bold text-gray-800">
            Se connecter
          </h2>
          <div className="w-6" />
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center py-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center mb-0.5 shadow-lg overflow-hidden">
            <img 
              src="/images/logo2.png" 
              alt="KAMRI Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-sm font-bold text-green-600">KAMRI</h3>
        </div>

        {/* Titre simple */}
        <div className="text-center mb-1">
          <h3 className="text-sm font-bold text-gray-800">Se connecter</h3>
        </div>

        {/* Contenu du formulaire */}
        <div className="px-1 pb-1">
          {renderLoginForm()}
        </div>
      </div>
    </div>
  );
}