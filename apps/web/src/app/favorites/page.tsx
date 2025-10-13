'use client';

import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Tablettes', 'Accessoires'];

  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // Simulation d'appel API - pour l'instant retourne un tableau vide
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFavorites([]);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'date':
      default:
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    }
  });

  const toggleFavorite = (id) => {
    setFavorites(items => 
      items.map(item => 
        item.id === id ? { ...item, isLiked: !item.isLiked } : item
      )
    );
  };

  const removeFromFavorites = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de vos favoris ?')) {
      setFavorites(items => items.filter(item => item.id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === filteredFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredFavorites.map(item => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const removeSelected = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.size} article(s) de vos favoris ?`)) {
      setFavorites(items => items.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#424242] mb-2">Mes Favoris</h1>
          <p className="text-[#81C784]">
            {favorites.length} article(s) dans vos favoris
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher dans vos favoris..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="date">Plus récent</option>
                <option value="price">Prix croissant</option>
                <option value="name">Nom A-Z</option>
                <option value="rating">Mieux noté</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {viewMode === 'grid' ? '📋' : '⊞'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions en lot */}
        {filteredFavorites.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredFavorites.length}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  {selectedItems.size === filteredFavorites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>

                {selectedItems.size > 0 && (
                  <>
                    <span className="text-gray-600">
                      {selectedItems.size} article(s) sélectionné(s)
                    </span>
                    <button
                      onClick={removeSelected}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Supprimer sélection
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* État de chargement */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedFavorites.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      {item.isOnSale && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{formatDiscountPercentage(calculateDiscountPercentage(item.originalPrice, item.price))}%
                        </div>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({item.reviews} avis)</span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">
                          ${item.price}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                        {item.savings > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            Économie: ${item.savings}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {item.inStock ? (
                          <span className="text-green-600">
                            En stock ({item.stockCount} disponibles)
                          </span>
                        ) : (
                          <span className="text-red-500">Rupture de stock</span>
                        )}
                        {item.priceAlert && (
                          <span className="text-orange-500">⚠️ Alerte prix</span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleSelection(item.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                      </button>
                      
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Retirer des favoris"
                      >
                        ❤️
                      </button>
                      
                      <button
                        onClick={() => removeFromFavorites(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery || filterCategory !== 'all' ? 'Aucun favori trouvé' : 'Aucun favori pour le moment'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterCategory !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez à ajouter des produits à vos favoris !'
              }
            </p>
          </div>
        )}
      </div>
      
      <HomeFooter />
    </div>
  );
}