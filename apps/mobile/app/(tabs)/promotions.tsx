import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CategoryTabs from '../../components/CategoryTabs';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import ProductCard from '../../components/ProductCard';
import UnifiedHeader from '../../components/UnifiedHeader';
import { ThemedText } from '../../components/themed-text';
import { useFilter } from '../../contexts/FilterContext';
import { apiClient, Category, Product } from '../../lib/api';

export default function PromotionsPage() {
  const { showFilters, toggleFilters } = useFilter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [loading, setLoading] = useState<boolean>(true);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🎯 [PROMOTIONS-MOBILE] Début du chargement des données');
        setLoading(true);
        
        // Charger les catégories
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.data) {
          const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
          const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
          console.log('📂 [PROMOTIONS-MOBILE] Catégories chargées:', categoriesList.length);
          setCategories(categoriesList);
        }

        // Charger les produits
        const productsResponse = await apiClient.getProducts();
        if (productsResponse.data) {
          const backendData = productsResponse.data.data || productsResponse.data;
          const productsList = Array.isArray(backendData) ? backendData : [];
          console.log('🛍️ [PROMOTIONS-MOBILE] Produits chargés:', productsList.length);
          setProducts(productsList);
        }
      } catch (error) {
        console.error('❌ [PROMOTIONS-MOBILE] Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
        console.log('🎯 [PROMOTIONS-MOBILE] Chargement terminé');
      }
    };

    loadData();
  }, []);

  // Fonction de filtrage simple et claire
  const filterProducts = () => {
    console.log('🎯 [PROMOTIONS-MOBILE] === DÉBUT DU FILTRAGE ===');
    console.log('🎯 [PROMOTIONS-MOBILE] Produits totaux:', products.length);
    console.log('🎯 [PROMOTIONS-MOBILE] Catégorie sélectionnée:', selectedCategory);
    console.log('🎯 [PROMOTIONS-MOBILE] Recherche:', searchQuery);
    console.log('🎯 [PROMOTIONS-MOBILE] Tri:', sortBy);
    console.log('🎯 [PROMOTIONS-MOBILE] Prix:', priceRange);
    
    // Étape 1: Filtrer seulement les produits en promotion
    let promoProducts = products.filter(product => {
      const isPromo = product.badge === 'promo' || (product.originalPrice && product.originalPrice > product.price);
      return isPromo;
    });
    
    console.log('🎯 [PROMOTIONS-MOBILE] Produits en promotion:', promoProducts.length);
    
    // Étape 2: Filtrer par catégorie si nécessaire
    if (selectedCategory !== 'tous') {
      console.log('🎯 [PROMOTIONS-MOBILE] Filtrage par catégorie:', selectedCategory);
      
      promoProducts = promoProducts.filter(product => {
        const categoryId = product.category?.id;
        const matches = categoryId === selectedCategory;
        console.log('🎯 [PROMOTIONS-MOBILE] Produit:', product.name, 'Catégorie:', categoryId, 'Match:', matches);
        return matches;
      });
    }
    
    // Étape 3: Filtrer par recherche
    if (searchQuery) {
      promoProducts = promoProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Étape 4: Filtrer par prix
    promoProducts = promoProducts.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Étape 5: Trier
    switch (sortBy) {
      case 'prix_croissant':
        promoProducts.sort((a, b) => a.price - b.price);
        break;
      case 'prix_decroissant':
        promoProducts.sort((a, b) => b.price - a.price);
        break;
      case 'nouveautes':
        promoProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'stock':
        promoProducts.sort((a, b) => b.stock - a.stock);
        break;
      default: // populaire
        promoProducts.sort((a, b) => b.stock - a.stock);
    }
    
    console.log('🎯 [PROMOTIONS-MOBILE] Produits finaux après filtrage:', promoProducts.length);
    console.log('🎯 [PROMOTIONS-MOBILE] === FIN DU FILTRAGE ===');
    
    setFilteredProducts(promoProducts);
  };

  // Déclencher le filtrage quand les produits ou les filtres changent
  useEffect(() => {
    if (products.length > 0) {
      filterProducts();
    }
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
          <ThemedText style={styles.loadingTitle}>Chargement des promotions...</ThemedText>
          <ThemedText style={styles.loadingSubtitle}>Veuillez patienter</ThemedText>
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
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>🎯 Promotions</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Découvrez nos meilleures offres et économisez sur vos achats
            </ThemedText>
            <ThemedText style={styles.heroStats}>
              {filteredProducts.length} produits en promotion
            </ThemedText>
          </View>
        </View>

        {/* Filtres */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <ThemedText style={styles.filtersTitle}>Filtres</ThemedText>
              <TouchableOpacity onPress={toggleFilters}>
                <Ionicons name="close" size={24} color="#424242" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Rechercher</ThemedText>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#81C784" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher des promotions..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Trier par</ThemedText>
              <View style={styles.sortButtons}>
                {[
                  { value: 'populaire', label: 'Populaire' },
                  { value: 'nouveautes', label: 'Nouveautés' },
                  { value: 'prix_croissant', label: 'Prix ↑' },
                  { value: 'prix_decroissant', label: 'Prix ↓' },
                  { value: 'stock', label: 'Stock' },
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
          </View>
        )}

        {/* Onglets de catégories */}
        <View style={styles.categoriesSection}>
          <CategoryTabs 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </View>

        {/* Grille des produits */}
        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>🎯</ThemedText>
            <ThemedText style={styles.emptyTitle}>Aucune promotion trouvée</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Essayez de modifier vos critères de recherche
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
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
    marginTop: -2,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
  heroSection: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroStats: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginBottom: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContainer: {
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
});