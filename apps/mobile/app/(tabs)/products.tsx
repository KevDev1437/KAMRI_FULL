import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CategoryTabs from '../../components/CategoryTabs';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import ProductCard from '../../components/ProductCard';
import UnifiedHeader from '../../components/UnifiedHeader';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useFilter } from '../../contexts/FilterContext';
import { apiClient, Category, Product } from '../../lib/api';

// Interface Product mise à jour pour correspondre à l'API
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  badge?: string | null;
  stock: number;
  supplier?: {
    name: string;
  };
  discount?: number;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { showFilters, setShowFilters } = useFilter();
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🛍️ [PRODUCTS] Début du chargement des données');
        setLoading(true);
        
        // Charger les catégories
        console.log('📂 [PRODUCTS] Chargement des catégories...');
        const categoriesResponse = await apiClient.getCategories();
        console.log('📂 [PRODUCTS] Réponse catégories:', categoriesResponse);
        
        if (categoriesResponse.data) {
          const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
          const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
          console.log('📂 [PRODUCTS] Catégories chargées:', categoriesList.length);
          setCategories(categoriesList);
        }

        // Charger les produits
        console.log('🛍️ [PRODUCTS] Chargement des produits...');
        const productsResponse = await apiClient.getProducts();
        console.log('🛍️ [PRODUCTS] Réponse produits:', productsResponse);
        
        if (productsResponse.data) {
          const productsData = productsResponse.data.data || productsResponse.data;
          const productsList = Array.isArray(productsData) ? productsData : [];
          console.log('🛍️ [PRODUCTS] Produits chargés:', productsList.length);
          
          // Debug: Afficher les détails des premiers produits
          console.log('🛍️ [PRODUCTS] Détails des produits:', productsList.slice(0, 3).map(p => ({
            name: p.name,
            category: p.category?.name,
            hasImage: !!p.image,
            price: p.price
          })));
          
          setProducts(productsList);
        }
      } catch (error) {
        console.error('❌ [PRODUCTS] Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
        console.log('🛍️ [PRODUCTS] Chargement terminé');
      }
    };

    loadData();
  }, []);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => 
        product.category?.id === selectedCategory
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Tri
    switch (sortBy) {
      case 'prix_croissant':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'prix_decroissant':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nouveautes':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default: // populaire
        filtered.sort((a, b) => b.stock - a.stock);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  return (
    <View style={styles.container}>
      <UnifiedHeader />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Catégories */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Filtres mobiles */}
        {showFilters && (
          <ThemedView style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <ThemedText style={styles.filtersTitle}>Filtres</ThemedText>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#424242" />
              </TouchableOpacity>
            </View>
            
            {/* Tri */}
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Trier par</ThemedText>
              <View style={styles.sortButtons}>
                {[
                  { value: 'populaire', label: 'Populaire' },
                  { value: 'nouveautes', label: 'Nouveautés' },
                  { value: 'prix_croissant', label: 'Prix ↑' },
                  { value: 'prix_decroissant', label: 'Prix ↓' },
                  { value: 'note', label: 'Note' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      sortBy === option.value && styles.activeSortButton
                    ]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <ThemedText style={[
                      styles.sortButtonText,
                      sortBy === option.value && styles.activeSortButtonText
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Prix */}
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Prix</ThemedText>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  value={priceRange[0].toString()}
                  onChangeText={(text) => setPriceRange([Number(text) || 0, priceRange[1]])}
                  keyboardType="numeric"
                />
                <ThemedText style={styles.priceSeparator}>-</ThemedText>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  value={priceRange[1].toString()}
                  onChangeText={(text) => setPriceRange([priceRange[0], Number(text) || 2000])}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ThemedView>
        )}

        {/* Résultats */}
        <View style={styles.resultsContainer}>
          <ThemedText style={styles.resultsText}>
            {loading ? 'Chargement...' : `${filteredProducts.length} produits trouvés`}
          </ThemedText>
        </View>

        {/* État de chargement */}
        {loading ? (
          <View style={styles.loadingState}>
            <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
            <ThemedText style={styles.loadingTitle}>Chargement des produits...</ThemedText>
            <ThemedText style={styles.loadingSubtitle}>
              Veuillez patienter
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Grille de produits */}
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>

            {/* Message si aucun produit */}
            {filteredProducts.length === 0 && (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
                <ThemedText style={styles.emptyTitle}>Aucun produit trouvé</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Essayez de modifier vos critères de recherche
                </ThemedText>
              </View>
            )}
          </>
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
    paddingBottom: 120, // Espace pour la barre de navigation courbée
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 80,
    height: 30,
    transform: [{ scale: 2.5 }],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#424242',
    paddingVertical: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  titleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E8F5E8',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    position: 'relative',
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
  },
  actionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginTop: -2, // Réduire l'espace entre header et contenu
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
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
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
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
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    borderRadius: 8,
    fontSize: 14,
    color: '#424242',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#81C784',
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
});