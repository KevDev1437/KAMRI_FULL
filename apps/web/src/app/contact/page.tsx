'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactForm from '../../components/ContactForm';
import ContactInfo from '../../components/ContactInfo';
import FAQSection from '../../components/FAQSection';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function ContactPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormSubmit = (formData: any) => {
    // Simulation d'envoi de formulaire
    console.log('Données du formulaire:', formData);
    setShowSuccess(true);
    
    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Section en-tête */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              Une question, un problème ou une suggestion ? Écrivez-nous, notre équipe vous répond sous 24h.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section principale */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Colonne gauche - Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactForm onSubmit={handleFormSubmit} />
          </motion.div>

          {/* Colonne droite - Informations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ContactInfo />
          </motion.div>
        </div>
      </main>

      {/* Section FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* Message de succès */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-[#4CAF50] text-white px-6 py-4 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Message envoyé avec succès !</span>
          </div>
        </motion.div>
      )}
      
      <HomeFooter />
    </div>
  );
}
