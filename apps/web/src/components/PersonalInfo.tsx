'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PersonalInfo() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '', // Pas encore dans le backend
    address: '', // Pas encore dans le backend
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
  });

  const [formData, setFormData] = useState(userInfo);

  // Mettre à jour les données quand l'utilisateur change
  useEffect(() => {
    if (user) {
      const newUserInfo = {
        name: user.name || '',
        email: user.email || '',
        phone: '', // Pas encore dans le backend
        address: '', // Pas encore dans le backend
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
      };
      setUserInfo(newUserInfo);
      setFormData(newUserInfo);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 [PersonalInfo] Sauvegarde du profil...', formData);
      
      const result = await updateProfile({
        name: formData.name,
        email: formData.email
      });

      if (result.success) {
        console.log('✅ [PersonalInfo] Profil mis à jour avec succès');
        setUserInfo(formData);
        setIsEditing(false);
      } else {
        console.log('❌ [PersonalInfo] Erreur lors de la mise à jour:', result.error);
        alert('Erreur lors de la mise à jour: ' + result.error);
      }
    } catch (error) {
      console.error('❌ [PersonalInfo] Erreur:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(userInfo);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar et informations principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[#424242] mb-2">{userInfo.name}</h2>
            <p className="text-[#4CAF50] font-medium mb-1">{userInfo.email}</p>
            <p className="text-gray-500 text-sm">Membre depuis le {userInfo.memberSince}</p>
          </div>

        </div>
      </motion.div>

      {/* Formulaire d'informations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#424242]">Informations personnelles</h3>
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#45a049] transition-colors duration-300"
            >
              Modifier mes informations
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-300"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
              </motion.button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-2">
              Nom complet
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
              />
            ) : (
              <p className="text-[#424242] py-3">{userInfo.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-2">
              Adresse email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
              />
            ) : (
              <p className="text-[#424242] py-3">{userInfo.email}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-2">
              Numéro de téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
              />
            ) : (
              <p className="text-[#424242] py-3">{userInfo.phone}</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-2">
              Adresse
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
              />
            ) : (
              <p className="text-[#424242] py-3">{userInfo.address}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
