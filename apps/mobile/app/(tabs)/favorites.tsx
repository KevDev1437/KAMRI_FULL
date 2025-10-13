import { Ionicons } from '@expo/vector-icons';
import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Montres', 'Accessoires'];

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

  const toggleFavorite = (id: string) => {
    setFavorites(items => 
      items.map(item => 
        item.id === id ? { ...item, isLiked: !item.isLiked } : item
      )
    );
  };

  const removeFromFavorites = (id: string) => {
    Alert.alert(
      'Supprimer des favoris',
      'Êtes-vous sûr de vouloir supprimer cet article de vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setFavorites(items => items.filter(item => item.id !== id));
            setSelectedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
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
    if (selectedItems.size === filteredFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredFavorites.map(item => item.id)));
    }
  };

  const removeSelected = () => {
    if (selectedItems.size === 0) return;
    
    Alert.alert(
      'Supprimer les favoris sélectionnés',
      `Êtes-vous sûr de vouloir supprimer ${selectedItems.size} article(s) de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setFavorites(items => items.filter(item => !selectedItems.has(item.id)));
            setSelectedItems(new Set());
          }
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => {
    const isSelected = selectedItems.has(item.id);
    const discountPercentage = item.originalPrice > item.price 
      ? calculateDiscountPercentage(item.originalPrice, item.price)
      : 0;

    return (
      <View style={[styles.favoriteItem, isSelected && styles.selectedItem]}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleSelection(item.id)}
        >
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={20} 
            color={isSelected ? "#4CAF50" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}
          
          {item.isOnSale && (
            <View style={styles.saleBadge}>
              <ThemedText style={styles.saleBadgeText}>
                {formatDiscountPercentage(discountPercentage)}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          
          <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            <ThemedText style={styles.reviewsText}>({item.reviews})</ThemedText>
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>${item.price}</ThemedText>
            {item.originalPrice > item.price && (
              <ThemedText style={styles.originalPrice}>${item.originalPrice}</ThemedText>
            )}
          </View>

          <View style={styles.stockContainer}>
            {item.inStock ? (
              <ThemedText style={styles.inStockText}>
                En stock ({item.stockCount} disponibles)
              </ThemedText>
            ) : (
              <ThemedText style={styles.outOfStockText}>Rupture de stock</ThemedText>
            )}
          </View>

          <ThemedText style={styles.addedDate}>
            Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}
          </ThemedText>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={item.isLiked ? "#E91E63" : "#9CA3AF"} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => removeFromFavorites(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>

          {item.priceAlert && (
            <TouchableOpacity style={styles.alertButton}>
              <Ionicons name="notifications" size={16} color="#FF9800" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec recherche et filtres */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans vos favoris..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Filtres */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Trier par</ThemedText>
              <View style={styles.sortButtons}>
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'price', label: 'Prix' },
                  { key: 'name', label: 'Nom' },
                  { key: 'rating', label: 'Note' }
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.sortButton, sortBy === key && styles.activeSortButton]}
                    onPress={() => setSortBy(key)}
                  >
                    <ThemedText style={[
                      styles.sortButtonText, 
                      sortBy === key && styles.activeSortButtonText
                    ]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Catégorie</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryButtons}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton, 
                        filterCategory === category && styles.activeCategoryButton
                      ]}
                      onPress={() => setFilterCategory(category)}
                    >
                      <ThemedText style={[
                        styles.categoryButtonText,
                        filterCategory === category && styles.activeCategoryButtonText
                      ]}>
                        {category === 'all' ? 'Toutes' : category}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Actions en lot */}
        {filteredFavorites.length > 0 && (
          <View style={styles.bulkActions}>
            <TouchableOpacity style={styles.selectAllButton} onPress={selectAll}>
              <ThemedText style={styles.selectAllText}>
                {selectedItems.size === filteredFavorites.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </ThemedText>
            </TouchableOpacity>

            {selectedItems.size > 0 && (
              <TouchableOpacity style={styles.removeSelectedButton} onPress={removeSelected}>
                <Ionicons name="trash" size={16} color="#FFFFFF" />
                <ThemedText style={styles.removeSelectedText}>
                  Supprimer ({selectedItems.size})
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* État de chargement */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Chargement de vos favoris...</ThemedText>
          </View>
        ) : filteredFavorites.length > 0 ? (
          <FlatList
            data={sortedFavorites}
            renderItem={renderFavoriteItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#E91E63" />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery || filterCategory !== 'all' ? 'Aucun favori trouvé' : 'Aucun favori pour le moment'}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchQuery || filterCategory !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez à ajouter des produits à vos favoris !'
              }
            </ThemedText>
          </View>
        )}

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
    paddingBottom: 120,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
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
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  activeCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
  },
  selectAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  removeSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F44336',
    gap: 4,
  },
  removeSelectedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoritesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#424242',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    marginBottom: 4,
  },
  inStockText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  outOfStockText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  addedDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  alertButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});