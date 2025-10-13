'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import CategoryCard from '../../components/CategoryCard';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import PopularCategoriesSlider from '../../components/PopularCategoriesSlider';
import TrendingSection from '../../components/TrendingSection';

// Données mock pour les 7 catégories fixes
const categories = [
  {
    id: 1,
    name: 'Mode',
    image: '/api/placeholder/300/200',
    count: 156,
    color: '#FF6B6B',
    icon: '👕'
  },
  {
    id: 2,
    name: 'Technologie',
    image: '/api/placeholder/300/200',
    count: 89,
    color: '#4ECDC4',
    icon: '💻'
  },
  {
    id: 3,
    name: 'Maison',
    image: '/api/placeholder/300/200',
    count: 234,
    color: '#45B7D1',
    icon: '🏠'
  },
  {
    id: 4,
    name: 'Beauté',
    image: '/api/placeholder/300/200',
    count: 123,
    color: '#FECA57',
    icon: '💄'
  },
  {
    id: 5,
    name: 'Accessoires',
    image: '/api/placeholder/300/200',
    count: 67,
    color: '#96CEB4',
    icon: '🎒'
  },
  {
    id: 6,
    name: 'Sport',
    image: '/api/placeholder/300/200',
    count: 45,
    color: '#A8E6CF',
    icon: '⚽'
  },
  {
    id: 7,
    name: 'Enfants',
    image: '/api/placeholder/300/200',
    count: 78,
    color: '#FFB6C1',
    icon: '🧸'
  }
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Hero Section - Style comme l'accueil */}
      <section className="relative min-h-[600px] bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] w-full overflow-hidden shadow-lg">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu texte - Colonne gauche */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content space-y-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-[#1A3C2E] leading-tight tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Explorez nos catégories
              </h1>
              <p className="text-xl md:text-2xl text-[#4B6254] font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Découvrez une sélection soigneusement organisée de produits pour tous vos besoins
              </p>
              
              {/* Barre de recherche intégrée */}
              <div className="max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 pl-14 pr-4 border-2 border-[#4CAF50]/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Image - Colonne droite */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-image relative"
            >
              <div className="relative w-full h-[500px] overflow-hidden shadow-lg rounded-2xl">
                {/* Image de catégories */}
                <div className="w-full h-full bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/20 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center">
                      <div className="text-3xl mb-2">👗</div>
                      <div className="text-sm font-semibold text-[#4CAF50]">Mode</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center">
                      <div className="text-3xl mb-2">📱</div>
                      <div className="text-sm font-semibold text-[#4CAF50]">Tech</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center">
                      <div className="text-3xl mb-2">🏠</div>
                      <div className="text-sm font-semibold text-[#4CAF50]">Maison</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center">
                      <div className="text-3xl mb-2">⚽</div>
                      <div className="text-sm font-semibold text-[#4CAF50]">Sport</div>
                    </div>
                  </div>
                </div>
                
                {/* Overlay décoratif */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Éléments décoratifs subtils */}
        <div className="absolute top-8 right-8 w-16 h-16 bg-[#4CAF50]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-[#81C784]/10 rounded-full blur-2xl"></div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grille des catégories */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-[#424242] mb-8 text-center">
            Toutes les catégories
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Catégories populaires - Slider */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-[#424242] mb-8 text-center">
            Catégories populaires
          </h2>
          <PopularCategoriesSlider categories={categories.slice(0, 6)} />
        </motion.section>

        {/* Section Tendances */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <TrendingSection />
        </motion.section>
      </main>
      
      <HomeFooter />
    </div>
  );
}