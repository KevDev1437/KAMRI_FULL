'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import AccountSettings from '../../components/AccountSettings';
import AddressSection from '../../components/AddressSection';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import OrdersHistory from '../../components/OrdersHistory';
import PersonalInfo from '../../components/PersonalInfo';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Informations', icon: '👤' },
    { id: 'addresses', label: 'Adresses', icon: '🏠' },
    { id: 'orders', label: 'Commandes', icon: '📦' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Header de la page */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mon profil
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              Gérez vos informations et suivez vos commandes en un clin d'œil
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#4CAF50] text-white shadow-lg'
                    : 'bg-white text-[#424242] hover:bg-[#E8F5E8] hover:text-[#4CAF50]'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'personal' && <PersonalInfo />}
          {activeTab === 'addresses' && <AddressSection />}
          {activeTab === 'orders' && <OrdersHistory />}
          {activeTab === 'settings' && <AccountSettings />}
        </motion.div>
      </main>
      
      <HomeFooter />
    </div>
  );
}
