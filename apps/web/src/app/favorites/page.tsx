'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import { useFavorites } from '../../contexts/FavoritesContext';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Tablettes', 'Accessoires'];

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Note: Les favoris n'ont pas de catégorie dans notre contexte, on ignore le filtre de catégorie pour l'instant
    return matchesSearch;
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
        // Pour l'instant, on trie par nom par défaut
        return a.name.localeCompare(b.name);
    }
  });

  const handleRemoveFromFavorites = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de vos favoris ?')) {
      removeFromFavorites(id);
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
      selectedItems.forEach(id => removeFromFavorites(id));
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

        {/* Contenu des favoris */}
        {filteredFavorites.length > 0 ? (
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
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">Fake Store</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">
                          ${item.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">En stock</span>
                      </div>
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
                        onClick={() => handleRemoveFromFavorites(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Retirer des favoris"
                      >
                        ❤️
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