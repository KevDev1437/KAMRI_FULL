import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../../components/CurvedBottomNav';
import HomeFooter from '../../../components/HomeFooter';
import ProductCard from '../../../components/ProductCard';
import { ThemedText } from '../../../components/themed-text';
import UnifiedHeader from '../../../components/UnifiedHeader';
import { apiClient, Category, Product } from '../../../lib/api';

const { width } = Dimensions.get('window');

export default function CategoryProductsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      try {
        console.log('🛍️ [CATEGORY-PRODUCTS-MOBILE] Début du chargement des produits:', slug);
        setLoading(true);
        
        // Décoder le slug pour gérer les caractères spéciaux
        const decodedSlug = decodeURIComponent(slug);
        
        // Charger toutes les catégories pour trouver celle correspondant au slug
        const categoriesResponse = await apiClient.getCategories();
        console.log('📂 [CATEGORY-PRODUCTS-MOBILE] Réponse API catégories:', categoriesResponse);
        
        if (categoriesResponse.data) {
          const backendData = categoriesResponse.data.data || categoriesResponse.data;
          const categories = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORY-PRODUCTS-MOBILE] Catégories disponibles:', categories.length);
          
          // Trouver la catégorie par slug (nom en minuscules)
          const foundCategory = categories.find(cat => 
            cat.name.toLowerCase().replace(/\s+/g, '-') === decodedSlug
          );
          
          if (foundCategory) {
            console.log('📂 [CATEGORY-PRODUCTS-MOBILE] Catégorie trouvée:', foundCategory.name);
            setCategory(foundCategory);
            
            // Charger tous les produits
            const productsResponse = await apiClient.getProducts();
            if (productsResponse.data) {
              const backendProductsData = productsResponse.data.data || productsResponse.data;
              const allProducts = Array.isArray(backendProductsData) ? backendProductsData : [];
              
              // Filtrer les produits de cette catégorie
              const categoryProducts = allProducts.filter((product: Product) => 
                product.category?.name === foundCategory.name
              );
              
              console.log('🛍️ [CATEGORY-PRODUCTS-MOBILE] Produits trouvés:', categoryProducts.length);
              setProducts(categoryProducts);
              setFilteredProducts(categoryProducts);
            }
          } else {
            console.log('❌ [CATEGORY-PRODUCTS-MOBILE] Catégorie non trouvée pour le slug:', decodedSlug);
          }
        }
      } catch (error) {
        console.error('❌ [CATEGORY-PRODUCTS-MOBILE] Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
        console.log('🛍️ [CATEGORY-PRODUCTS-MOBILE] Chargement terminé');
      }
    };

    if (slug) {
      loadCategoryProducts();
    }
  }, [slug]);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtrage par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrage par prix
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
  }, [products, searchQuery, sortBy, priceRange]);

  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
          <ThemedText style={styles.loadingTitle}>Chargement des produits...</ThemedText>
          <ThemedText style={styles.loadingSubtitle}>Veuillez patienter</ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorIcon}>😞</ThemedText>
          <ThemedText style={styles.errorTitle}>Catégorie non trouvée</ThemedText>
          <ThemedText style={styles.errorSubtitle}>
            La catégorie que vous recherchez n'existe pas.
          </ThemedText>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Retour</ThemedText>
          </TouchableOpacity>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header de la catégorie */}
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <ThemedText style={styles.categoryIcon}>{category.icon || '🛍️'}</ThemedText>
            <View style={styles.categoryDetails}>
              <ThemedText style={styles.categoryTitle}>{category.name}</ThemedText>
              <ThemedText style={styles.productCount}>
                {filteredProducts.length} produits trouvés
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#81C784" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans cette catégorie..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Filtres */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <ThemedText style={styles.filtersTitle}>Filtres</ThemedText>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#424242" />
              </TouchableOpacity>
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
                  onChangeText={(text) => setPriceRange([priceRange[0], Number(text) || 50000])}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}

        {/* Grille des produits */}
        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
            <ThemedText style={styles.emptyTitle}>Aucun produit trouvé</ThemedText>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButton: {
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
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
