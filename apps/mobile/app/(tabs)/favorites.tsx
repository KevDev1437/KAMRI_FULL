import { Ionicons } from '@expo/vector-icons';
import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useCounters } from '../../contexts/CounterContext';
import { apiClient } from '../../lib/api';

export default function FavoritesScreen() {
  const { user, isAuthenticated } = useAuth();
  const { favoritesCount, syncFromAPI } = useCounters();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Accessoires'];

  // Charger les favoris depuis l'API
  const loadFavorites = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ [FAVORIS-MOBILE] Utilisateur non connecté');
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      console.log('❤️ [FAVORIS-MOBILE] Chargement des favoris pour:', user.email);
      setLoading(true);
      
      const response = await apiClient.getWishlist();
      if (response.data) {
        const wishlistData = response.data.data || response.data;
        const favoritesArray = Array.isArray(wishlistData) ? wishlistData : [];
        
        // Extraire les données des produits depuis la structure imbriquée
        const extractedFavorites = favoritesArray.map(item => ({
          id: item.id,
          productId: item.productId,
          addedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue',
          ...item.product, // Extraire toutes les propriétés du produit
          isLiked: true, // Toujours true dans les favoris
        }));
        
        setFavorites(extractedFavorites);
        console.log('❤️ [FAVORIS-MOBILE] Favoris chargés:', extractedFavorites);
        
        // Synchroniser le compteur avec les vraies données
        syncFromAPI(extractedFavorites.length, 0); // On ne met à jour que les favoris ici
      } else {
        console.log('❌ [FAVORIS-MOBILE] Aucune donnée de favoris reçue');
        console.log('❌ [FAVORIS-MOBILE] Erreur:', response.error);
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ [FAVORIS-MOBILE] Erreur lors du chargement des favoris:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Recharger les favoris quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [isAuthenticated, user])
  );

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated, user]);

  // Recharger les favoris quand le compteur change (ajout/suppression depuis d'autres pages)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [FAVORIS-MOBILE] Compteur favoris changé, rechargement...');
      loadFavorites();
    }
  }, [favoritesCount, isAuthenticated, user]);

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.category?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category?.name === filterCategory;
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

  const toggleFavorite = async (productId: string) => {
    try {
      console.log('❤️ [FAVORIS-MOBILE] Toggle favori:', productId);
      await apiClient.addToWishlist(productId);
      await loadFavorites(); // Recharger les favoris
    } catch (error) {
      console.error('❌ [FAVORIS-MOBILE] Erreur lors du toggle favori:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const removeFromFavorites = (productId: string) => {
    Alert.alert(
      'Supprimer des favoris',
      'Êtes-vous sûr de vouloir supprimer cet article de vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [FAVORIS-MOBILE] Suppression favori:', productId);
              await apiClient.removeFromWishlist(productId);
              await loadFavorites(); // Recharger les favoris
              setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
              });
            } catch (error) {
              console.error('❌ [FAVORIS-MOBILE] Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer des favoris');
            }
          }
        }
      ]
    );
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
      Alert.alert('Aucune sélection', 'Veuillez sélectionner au moins un article');
      return;
    }
    Alert.alert('Ajout au panier', `${selectedCount} article(s) ajouté(s) au panier`);
  };

  const togglePriceAlert = (id: string) => {
    setFavorites(items => 
      items.map(item => 
        item.id === id ? { ...item, priceAlert: !item.priceAlert } : item
      )
    );
  };

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <View style={styles.favoriteItem}>
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => toggleSelection(item.id)}
      >
        <Ionicons 
          name={selectedItems.has(item.id) ? "checkbox" : "square-outline"} 
          size={20} 
          color={selectedItems.has(item.id) ? "#4CAF50" : "#9CA3AF"} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={item.isLiked ? "#FF5722" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.itemCategory}>{item.category?.name || 'Catégorie inconnue'}</ThemedText>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            <ThemedText style={styles.reviewsText}>({item.reviews})</ThemedText>
          </View>
          <ThemedText style={styles.addedDate}>Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}</ThemedText>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>{item.price}$</ThemedText>
            {item.originalPrice > item.price && (
              <ThemedText style={styles.originalPrice}>{item.originalPrice}$</ThemedText>
            )}
          </View>
          {item.originalPrice > item.price && (
            <View style={styles.savingsBadge}>
              <ThemedText style={styles.savingsText}>
                {formatDiscountPercentage(calculateDiscountPercentage(item.originalPrice, item.price))}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.stockRow}>
          <View style={styles.stockInfo}>
            <Ionicons 
              name={item.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={item.stock > 0 ? "#4CAF50" : "#FF5722"} 
            />
            <ThemedText style={[
              styles.stockText, 
              { color: item.stock > 0 ? "#4CAF50" : "#FF5722" }
            ]}>
              {item.stock > 0 ? `${item.stock} en stock` : 'Rupture de stock'}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.priceAlertButton}
            onPress={() => togglePriceAlert(item.id)}
          >
            <Ionicons 
              name={item.priceAlert ? "notifications" : "notifications-outline"} 
              size={16} 
              color={item.priceAlert ? "#4CAF50" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.addToCartButton]}
            disabled={!item.inStock}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.addToCartText}>Ajouter au panier</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeFromFavorites(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF5722" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Affichage pour utilisateur non connecté
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.notConnectedContainer}>
          <ThemedText style={styles.notConnectedTitle}>Connexion requise</ThemedText>
          <ThemedText style={styles.notConnectedSubtitle}>
            Connectez-vous pour voir vos favoris
          </ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  // Affichage de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Chargement de vos favoris...</ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient colors={['#EAF3EE', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBackground} />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>Mes Favoris</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{favorites.length} article(s) dans vos favoris</ThemedText>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans vos favoris..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterTitle}>Trier par</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
                {[
                  { key: 'date', label: 'Date d\'ajout' },
                  { key: 'price', label: 'Prix' },
                  { key: 'name', label: 'Nom' },
                  { key: 'rating', label: 'Note' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortOption,
                      sortBy === option.key && styles.sortOptionActive
                    ]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <ThemedText style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.sortOptionTextActive
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.filterTitle}>Catégorie</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      filterCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setFilterCategory(category)}
                  >
                    <ThemedText style={[
                      styles.categoryOptionText,
                      filterCategory === category && styles.categoryOptionTextActive
                    ]}>
                      {category === 'all' ? 'Toutes' : category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Header avec actions */}
        <View style={styles.favoritesHeader}>
          <TouchableOpacity style={styles.selectAllButton} onPress={selectAll}>
            <Ionicons 
              name={selectedItems.size === sortedFavorites.length ? "checkbox" : "square-outline"} 
              size={20} 
              color={selectedItems.size === sortedFavorites.length ? "#4CAF50" : "#9CA3AF"} 
            />
            <ThemedText style={styles.selectAllText}>
              {selectedItems.size === sortedFavorites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </ThemedText>
          </TouchableOpacity>
          
          {selectedItems.size > 0 && (
            <TouchableOpacity style={styles.addSelectedButton} onPress={addSelectedToCart}>
              <Ionicons name="cart" size={18} color="#4CAF50" />
              <ThemedText style={styles.addSelectedText}>Ajouter ({selectedItems.size})</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Liste des favoris */}
        <FlatList
          data={sortedFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.favoritesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>❤️</ThemedText>
              <ThemedText style={styles.emptyTitle}>Aucun favori trouvé</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Commencez à ajouter des produits à vos favoris'}
              </ThemedText>
            </View>
          }
        />

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Vos statistiques</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{favorites.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Articles favoris</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {favorites.filter(item => item.priceAlert).length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Alertes prix</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {favorites.filter(item => item.isOnSale).length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>En promotion</ThemedText>
            </View>
          </View>
        </View>

        <HomeFooter />
      </ScrollView>
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 100, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    marginTop: -8, // Réduire l'espace entre header et contenu
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
  },
  // Hero Section
  heroContainer: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  // Search and Filters
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#424242',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: '#4CAF50',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  categoryOptions: {
    flexDirection: 'row',
  },
  categoryOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#4CAF50',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  // Favorites Header
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  addSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addSelectedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Favorites List
  favoritesList: {
    paddingHorizontal: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButton: {
    marginRight: 12,
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    marginRight: 8,
  },
  likeButton: {
    padding: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceAlertButton: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Statistics
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Nouveaux styles pour les états
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  notConnectedSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
});
