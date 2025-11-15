'use client';

import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { motion } from 'framer-motion';
import { useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import { useWishlist } from '../../contexts/WishlistContext';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

export default function FavoritesPage() {
  const { wishlistItems, wishlistCount, loading, removeFromWishlist } = useWishlist();
  
  // Alias pour compatibilité avec vérification de sécurité
  const favorites = Array.isArray(wishlistItems) ? wishlistItems : [];

  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
    }
  };

  const handlePriceAlert = (productId: string) => {
    // TODO: Implémenter l'alerte de prix
    console.log('Alerte de prix pour le produit:', productId);
  };

  const handleMoveToCart = (productId: string) => {
    // TODO: Implémenter le déplacement vers le panier
    console.log('Déplacer vers le panier:', productId);
  };

  // Filtrage et tri avec vérification de sécurité
  const filteredFavorites = favorites.filter(item => {
    if (!item || !item.product) return false;
    if (filterBy === 'inStock') return item.product.stock > 0;
    if (filterBy === 'onSale') return item.product.originalPrice && item.product.originalPrice > item.product.price;
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (!a || !b || !a.product || !b.product) return 0;
    if (sortBy === 'price') return a.product.price - b.product.price;
    if (sortBy === 'name') return a.product.name.localeCompare(b.product.name);
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4CAF50] via-[#66BB6A] to-[#81C784] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Mes Favoris
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {loading ? 'Chargement...' : `${favorites.length} article(s) dans vos favoris`}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtres et tri */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-[#424242] mb-4">Filtres</h3>
              
              {/* Tri */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#424242] mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="date">Date d'ajout</option>
                  <option value="price">Prix</option>
                  <option value="name">Nom</option>
                </select>
              </div>

              {/* Filtres */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#424242] mb-2">Filtrer par</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filter"
                      value="all"
                      checked={filterBy === 'all'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 text-[#4CAF50]"
                    />
                    <span className="text-sm">Tous</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filter"
                      value="inStock"
                      checked={filterBy === 'inStock'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 text-[#4CAF50]"
                    />
                    <span className="text-sm">En stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filter"
                      value="onSale"
                      checked={filterBy === 'onSale'}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="mr-2 text-[#4CAF50]"
                    />
                    <span className="text-sm">En promotion</span>
                  </label>
                </div>
              </div>

              {/* Statistiques */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-[#424242] mb-2">Statistiques</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold text-[#4CAF50]">{favorites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En stock:</span>
                    <span>{favorites.filter(item => item && item.product && item.product.stock > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En promo:</span>
                    <span>{favorites.filter(item => item && item.product && item.product.originalPrice && item.product.originalPrice > item.product.price).length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Header avec options d'affichage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-[#424242]">
                    {sortedFavorites.length} article(s) trouvé(s)
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Liste des favoris */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement de vos favoris...</p>
              </div>
            ) : sortedFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#424242] mb-2">Aucun favori</h3>
                <p className="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à vos favoris</p>
                <a href="/products" className="inline-flex items-center px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors">
                  Voir nos produits
                </a>
              </motion.div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {sortedFavorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        {(() => {
                          const imageUrl = getCleanImageUrl(item.product.image);
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null;
                        })()}
                        <div className={`${getCleanImageUrl(item.product.image) ? 'hidden' : 'flex'} w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 items-center justify-center`}>
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        
                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#424242] mb-2 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>{item.product.name}</h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {item.product.category?.name || 'Non catégorisé'} • {item.product.supplier?.name || 'N/A'}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl font-bold text-[#4CAF50]">{item.product.price}$</span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <>
                                <span className="text-sm text-gray-500 line-through">{item.product.originalPrice}$</span>
                                <span className="bg-[#E8F5E8] text-[#4CAF50] px-2 py-1 rounded-full text-xs font-medium">
                                  {formatDiscountPercentage(calculateDiscountPercentage(item.product.originalPrice, item.product.price))}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.product.stock > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.product.stock > 0 ? 'En stock' : 'Rupture'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleRemoveFromFavorites(item.productId)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer des favoris"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {item.product.stock > 0 && (
                            <button
                              onClick={() => handleMoveToCart(item.productId)}
                              className="p-2 text-[#4CAF50] hover:text-[#45a049] hover:bg-green-50 rounded-lg transition-colors"
                              title="Ajouter au panier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}