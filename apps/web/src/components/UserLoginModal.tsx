'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserLoginModal({ isOpen, onClose }: UserLoginModalProps) {
  const { login, availableUsers, loadAvailableUsers } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen, loadAvailableUsers]);

  const handleLogin = async () => {
    if (!selectedEmail) {
      setMessage('Veuillez sélectionner un utilisateur');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await login(selectedEmail);
      if (result.success) {
        setMessage('Connexion réussie !');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 1000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#424242] mb-2">
            Connexion Test
          </h2>
          <p className="text-[#81C784]">
            Sélectionnez un utilisateur Fake Store pour vous connecter
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-2">
              Utilisateur
            </label>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full p-3 border border-[#E8F5E8] rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            >
              <option value="">Sélectionnez un utilisateur</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('réussie') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#E8F5E8] text-[#424242] rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleLogin}
              disabled={isLoading || !selectedEmail}
              className="flex-1 px-4 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#E8F5E8] rounded-lg">
          <h3 className="font-semibold text-[#424242] mb-2">Utilisateurs disponibles :</h3>
          <div className="text-sm text-[#81C784]">
            {availableUsers.length} utilisateurs Fake Store synchronisés
          </div>
        </div>
      </div>
    </div>
  );
}
