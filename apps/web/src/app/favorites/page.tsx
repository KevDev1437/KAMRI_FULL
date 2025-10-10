'use client';

import { motion } from 'framer-motion';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function FavoritesPage() {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mes favoris
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              Retrouvez tous vos produits favoris en un seul endroit
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-[#424242] mb-4">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-500 mb-8">
              Commencez à ajouter des produits à vos favoris en cliquant sur le cœur
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4CAF50] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#45a049] transition-colors duration-300"
            >
              Découvrir nos produits
            </motion.button>
          </div>
        </motion.div>
      </main>
      
      <HomeFooter />
    </div>
  );
}
