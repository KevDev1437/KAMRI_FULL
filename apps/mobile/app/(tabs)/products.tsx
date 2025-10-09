import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryTabs from '../../components/CategoryTabs';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import ProductCard from '../../components/ProductCard';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

// Mock data pour les produits
const mockProducts = [
  { 
    id: '1', 
    name: 'T-Shirt Premium', 
    price: 29.99, 
    originalPrice: 39.99,
    image: null, 
    category: 'mode',
    rating: 4.5,
    reviews: 128,
    badge: 'tendance',
    brand: 'KAMRI'
  },
  { 
    id: '2', 
    name: 'Jean Slim Fit', 
    price: 59.99, 
    originalPrice: null,
    image: null, 
    category: 'mode',
    rating: 4.2,
    reviews: 89,
    badge: 'nouveau',
    brand: 'KAMRI'
  },
  { 
    id: '3', 
    name: 'Smartphone Pro', 
    price: 899.99, 
    originalPrice: 999.99,
    image: null, 
    category: 'technologie',
    rating: 4.8,
    reviews: 256,
    badge: 'promo',
    brand: 'TechBrand'
  },
  { 
    id: '4', 
    name: 'Veste Denim', 
    price: 79.99, 
    originalPrice: null,
    image: null, 
    category: 'mode',
    rating: 4.3,
    reviews: 67,
    badge: null,
    brand: 'KAMRI'
  },
  { 
    id: '5', 
    name: 'Laptop Gaming', 
    price: 1299.99, 
    originalPrice: 1499.99,
    image: null, 
    category: 'technologie',
    rating: 4.7,
    reviews: 189,
    badge: 'promo',
    brand: 'GameTech'
  },
  { 
    id: '6', 
    name: 'Sac à Main', 
    price: 49.99, 
    originalPrice: null,
    image: null, 
    category: 'accessoires',
    rating: 4.1,
    reviews: 45,
    badge: 'nouveau',
    brand: 'KAMRI'
  },
  { 
    id: '7', 
    name: 'Parfum Élégant', 
    price: 89.99, 
    originalPrice: 119.99,
    image: null, 
    category: 'beaute',
    rating: 4.6,
    reviews: 203,
    badge: 'promo',
    brand: 'Luxury'
  },
  { 
    id: '8', 
    name: 'Chaise Design', 
    price: 199.99, 
    originalPrice: null,
    image: null, 
    category: 'maison',
    rating: 4.4,
    reviews: 78,
    badge: 'tendance',
    brand: 'HomeStyle'
  },
];

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  rating: number;
  reviews: number;
  badge: string | null;
  brand: string;
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'note':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // populaire
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  return (
    <View style={styles.container}>
      {/* Header complet */}
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#81C784" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit..."
              placeholderTextColor="#81C784"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Bouton filtres */}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Catégories */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
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
            {filteredProducts.length} produits trouvés
          </ThemedText>
        </View>

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
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
  },
  scrollView: {
    flex: 1,
    marginTop: 0, // No space - content goes directly under header
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
});