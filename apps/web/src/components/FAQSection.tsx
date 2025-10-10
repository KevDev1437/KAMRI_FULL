'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Où est ma commande ?',
      answer: 'Vous pouvez suivre votre commande en temps réel depuis votre espace client. Nous vous envoyons également des notifications par email à chaque étape de l\'expédition. Si vous ne trouvez pas votre commande, contactez notre service client.'
    },
    {
      question: 'Comment retourner un produit ?',
      answer: 'Le retour est simple et gratuit ! Connectez-vous à votre compte, sélectionnez la commande concernée et cliquez sur "Retourner". Nous vous enverrons une étiquette de retour prépayée. Vous avez 30 jours pour effectuer votre retour.'
    },
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'La livraison standard est de 2-3 jours ouvrés en France métropolitaine. Pour les livraisons express, comptez 24h. Les livraisons à l\'étranger prennent 5-7 jours ouvrés selon la destination.'
    },
    {
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay et les virements bancaires. Tous les paiements sont sécurisés par cryptage SSL.'
    },
    {
      question: 'Puis-je modifier ou annuler ma commande ?',
      answer: 'Vous pouvez modifier ou annuler votre commande dans les 2 heures suivant la validation. Passé ce délai, la commande est en cours de préparation et ne peut plus être modifiée. Contactez-nous en cas d\'urgence.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-[#4CAF50] mb-4">
        Questions fréquentes
      </h2>
      <p className="text-lg text-[#424242] mb-12">
        Trouvez rapidement les réponses à vos questions
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
            >
              <span className="font-semibold text-[#424242] text-lg">
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 ml-4"
              >
                <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-[#424242] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12"
      >
        <p className="text-[#424242] mb-4">
          Vous ne trouvez pas la réponse à votre question ?
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#4CAF50] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#45a049] transition-colors duration-300"
        >
          Contactez notre support
        </motion.button>
      </motion.div>
    </div>
  );
}
