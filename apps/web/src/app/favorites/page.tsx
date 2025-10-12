'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 1299,
      originalPrice: 1399,
      image: 'https://images.unsplash.com/photo-1592899677977-9d26d3ba4f33?w=300',
      category: 'Smartphones',
      rating: 4.8,
      reviews: 1247,
      inStock: true,
      stockCount: 15,
      isOnSale: true,
      savings: 100,
      addedDate: '2024-01-15',
      priceAlert: false,
      isLiked: true
    },
    {
      id: '2',
      name: 'MacBook Air M2',
      price: 1199,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      category: 'Ordinateurs',
      rating: 4.9,
      reviews: 892,
      inStock: false,
      stockCount: 0,
      isOnSale: false,
      savings: 0,
      addedDate: '2024-01-10',
      priceAlert: true,
      isLiked: true
    },
    {
      id: '3',
      name: 'AirPods Pro 2',
      price: 249,
      originalPrice: 279,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
      category: 'Audio',
      rating: 4.7,
      reviews: 2156,
      inStock: true,
      stockCount: 8,
      isOnSale: true,
      savings: 30,
      addedDate: '2024-01-12',
      priceAlert: false,
      isLiked: true
    },
    {
      id: '4',
      name: 'Apple Watch Series 9',
      price: 399,
      originalPrice: 449,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300',
      category: 'Montres',
      rating: 4.6,
      reviews: 1834,
      inStock: true,
      stockCount: 22,
      isOnSale: true,
      savings: 50,
      addedDate: '2024-01-08',
      priceAlert: true,
      isLiked: true
    },
    {
      id: '5',
      name: 'iPad Pro 12.9"',
      price: 1099,
      originalPrice: 1099,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
      category: 'Tablettes',
      rating: 4.8,
      reviews: 756,
      inStock: true,
      stockCount: 12,
      isOnSale: false,
      savings: 0,
      addedDate: '2024-01-05',
      priceAlert: false,
      isLiked: true
    },
    {
      id: '6',
      name: 'Magic Keyboard',
      price: 299,
      originalPrice: 329,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300',
      category: 'Accessoires',
      rating: 4.5,
      reviews: 432,
      inStock: true,
      stockCount: 25,
      isOnSale: true,
      savings: 30,
      addedDate: '2024-01-03',
      priceAlert: false,
      isLiked: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Tablettes', 'Accessoires'];

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

  const toggleFavorite = (id: string) => {
    setFavorites(items => 
      items.map(item => 
        item.id === id ? { ...item, isLiked: !item.isLiked } : item
      )
    );
  };

  const removeFromFavorites = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article de vos favoris ?')) {
      setFavorites(items => items.filter(item => item.id !== id));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleSelection = (id: string) => {
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
    if (selectedItems.size === sortedFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedFavorites.map(item => item.id)));
    }
  };

  const addSelectedToCart = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) {
      alert('Veuillez sélectionner au moins un article');
      return;
    }
    alert(`${selectedCount} article(s) ajouté(s) au panier`);
  };

  const togglePriceAlert = (id: string) => {
    setFavorites(items => 
      items.map(item => 
        item.id === id ? { ...item, priceAlert: !item.priceAlert } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F8F0]">
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#EAF3EE] to-[#FFFFFF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-4">
              Mes Favoris
            </h1>
            <p className="text-lg sm:text-xl text-[#424242] mb-8 max-w-3xl mx-auto">
              {favorites.length} article(s) dans vos favoris
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtres et tri */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
            >
              {/* Recherche */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#424242] mb-4">Rechercher</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans vos favoris..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Tri */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#424242] mb-4">Trier par</h3>
                <div className="space-y-2">
                  {[
                    { key: 'date', label: 'Date d\'ajout' },
                    { key: 'price', label: 'Prix' },
                    { key: 'name', label: 'Nom' },
                    { key: 'rating', label: 'Note' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 ${
                        sortBy === option.key
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#424242] mb-4">Catégorie</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 ${
                        filterCategory === category
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'Toutes les catégories' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistiques */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-[#424242] mb-4">Vos statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total favoris</span>
                    <span className="font-semibold text-[#4CAF50]">{favorites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alertes prix</span>
                    <span className="font-semibold text-[#4CAF50]">
                      {favorites.filter(item => item.priceAlert).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">En promotion</span>
                    <span className="font-semibold text-[#4CAF50]">
                      {favorites.filter(item => item.isOnSale).length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Header avec actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 text-[#424242] hover:text-[#4CAF50] transition-colors duration-300"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedItems.size === sortedFavorites.length 
                        ? 'bg-[#4CAF50] border-[#4CAF50]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedItems.size === sortedFavorites.length && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">
                      {selectedItems.size === sortedFavorites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </span>
                  </button>
                  
                  {selectedItems.size > 0 && (
                    <button
                      onClick={addSelectedToCart}
                      className="flex items-center gap-2 bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#45a049] transition-colors duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Ajouter ({selectedItems.size})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Vue :</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      viewMode === 'grid' ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      viewMode === 'list' ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Grille des favoris */}
            {sortedFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <div className="text-6xl mb-6">❤️</div>
                <h2 className="text-2xl font-bold text-[#424242] mb-4">
                  Aucun favori trouvé
                </h2>
                <p className="text-gray-500 mb-8">
                  {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Commencez à ajouter des produits à vos favoris'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#4CAF50] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#45a049] transition-colors duration-300"
                >
                  Découvrir nos produits
                </motion.button>
              </motion.div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedFavorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`${viewMode === 'list' ? 'flex-1 flex' : ''}`}>
                      {/* Image */}
                      <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full h-48'}`}>
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-full'}`}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {item.isOnSale && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              -{item.savings}€
                            </span>
                          )}
                          {!item.inStock && (
                            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Rupture
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-2 rounded-full transition-colors duration-300 ${
                              item.isLiked 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => togglePriceAlert(item.id)}
                            className={`p-2 rounded-full transition-colors duration-300 ${
                              item.priceAlert 
                                ? 'bg-[#4CAF50] text-white' 
                                : 'bg-white text-gray-400 hover:text-[#4CAF50]'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5l-5-5v5z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#424242] mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                          </div>
                          
                          <button
                            onClick={() => toggleSelection(item.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-4 ${
                              selectedItems.has(item.id) 
                                ? 'bg-[#4CAF50] border-[#4CAF50]' 
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedItems.has(item.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        {/* Note et avis */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium">{item.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({item.reviews} avis)</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        {/* Prix */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#4CAF50]">{item.price}€</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">{item.originalPrice}€</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              item.inStock ? 'text-[#4CAF50]' : 'text-red-500'
                            }`}>
                              {item.inStock ? `${item.stockCount} en stock` : 'Rupture de stock'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            disabled={!item.inStock}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-300 ${
                              item.inStock
                                ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Ajouter au panier
                          </button>
                          
                          <button
                            onClick={() => removeFromFavorites(item.id)}
                            className="p-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
