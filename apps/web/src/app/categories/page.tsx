'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CategoryCard from '../../components/CategoryCard';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import PopularCategoriesSlider from '../../components/PopularCategoriesSlider';
import TrendingSection from '../../components/TrendingSection';
import { apiClient } from '../../lib/api';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  category: {
    id: string;
    name: string;
  } | null;
}

// Mapping des icônes et couleurs pour les catégories
const getCategoryConfig = (categoryName: string) => {
  const configs: { [key: string]: { icon: string; color: string } } = {
    'Mode': { icon: '👕', color: '#FF6B6B' },
    'Technologie': { icon: '💻', color: '#4ECDC4' },
    'Maison': { icon: '🏠', color: '#45B7D1' },
    'Beauté': { icon: '💄', color: '#FECA57' },
    'Accessoires': { icon: '🎒', color: '#96CEB4' },
    'Sport': { icon: '⚽', color: '#A8E6CF' },
    'Enfants': { icon: '🧸', color: '#FFB6C1' },
  };
  return configs[categoryName] || { icon: '🛍️', color: '#4CAF50' };
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories depuis l'API
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.data) {
          const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
          const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
          
          // Charger les produits pour compter par catégorie
          const productsResponse = await apiClient.getProducts();
          if (productsResponse.data) {
            const products = productsResponse.data;
            
            // Enrichir les catégories avec le nombre de produits et la configuration
            const enrichedCategories = categoriesList.map(category => {
              const productCount = products.filter((product: Product) => 
                product.category?.id === category.id
              ).length;
              
              const config = getCategoryConfig(category.name);
              
              return {
                id: category.id,
                name: category.name,
                image: '/api/placeholder/300/200',
                count: productCount, // Afficher 0 si pas de produits
                color: config.color,
                icon: config.icon
              };
            });
            
            setCategories(enrichedCategories);
          } else {
            // Si pas de produits, afficher quand même les catégories avec 0 produits
            const enrichedCategories = categoriesList.map(category => {
              const config = getCategoryConfig(category.name);
              
              return {
                id: category.id,
                name: category.name,
                image: '/api/placeholder/300/200',
                count: 0,
                color: config.color,
                icon: config.icon
              };
            });
            
            setCategories(enrichedCategories);
          }
        } else {
          // Si pas de catégories, afficher un message
          setCategories([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

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
          
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-[#424242] mb-2">
                Chargement des catégories...
              </h3>
              <p className="text-[#81C784]">
                Veuillez patienter
              </p>
            </div>
          ) : filteredCategories.length > 0 ? (
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
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-[#424242] mb-2">
                Aucune catégorie trouvée
              </h3>
              <p className="text-[#81C784]">
                Les catégories seront disponibles bientôt
              </p>
            </div>
          )}
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