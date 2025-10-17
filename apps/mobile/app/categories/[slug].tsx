import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import ProductCard from '../../components/ProductCard';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';
import { apiClient, Category, Product } from '../../lib/api';

const { width } = Dimensions.get('window');

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        console.log('📂 [CATEGORY-MOBILE] Début du chargement de la catégorie:', slug);
        setLoading(true);
        
        // Décoder le slug pour gérer les caractères spéciaux
        const decodedSlug = decodeURIComponent(slug);
        
        // Charger toutes les catégories pour trouver celle correspondant au slug
        const categoriesResponse = await apiClient.getCategories();
        console.log('📂 [CATEGORY-MOBILE] Réponse API catégories:', categoriesResponse);
        
        if (categoriesResponse.data) {
          const backendData = categoriesResponse.data.data || categoriesResponse.data;
          const categories = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORY-MOBILE] Catégories disponibles:', categories.length);
          
          // Trouver la catégorie par slug (nom en minuscules)
          const foundCategory = categories.find(cat => 
            cat.name.toLowerCase().replace(/\s+/g, '-') === decodedSlug
          );
          
          if (foundCategory) {
            console.log('📂 [CATEGORY-MOBILE] Catégorie trouvée:', foundCategory.name);
            setCategory(foundCategory);
            
            // Charger les produits de cette catégorie
            const productsResponse = await apiClient.getProducts();
            if (productsResponse.data) {
              const backendProductsData = productsResponse.data.data || productsResponse.data;
              const allProducts = Array.isArray(backendProductsData) ? backendProductsData : [];
              
              // Filtrer les produits de cette catégorie
              const categoryProducts = allProducts.filter((product: Product) => 
                product.category?.name === foundCategory.name
              );
              
              console.log('🛍️ [CATEGORY-MOBILE] Produits trouvés:', categoryProducts.length);
              setFeaturedProducts(categoryProducts.slice(0, 6)); // Limiter à 6 produits
            }
          } else {
            console.log('❌ [CATEGORY-MOBILE] Catégorie non trouvée pour le slug:', decodedSlug);
          }
        }
      } catch (error) {
        console.error('❌ [CATEGORY-MOBILE] Erreur lors du chargement de la catégorie:', error);
      } finally {
        setLoading(false);
        console.log('📂 [CATEGORY-MOBILE] Chargement terminé');
      }
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
          <ThemedText style={styles.loadingTitle}>Chargement de la catégorie...</ThemedText>
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
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#EAF3EE', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />
          
          <View style={styles.heroContent}>
            <View style={styles.categoryIconContainer}>
              <ThemedText style={styles.categoryIcon}>{category.icon || '🛍️'}</ThemedText>
            </View>
            <ThemedText style={styles.categoryTitle}>{category.name}</ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Découvrez notre sélection de produits dans cette catégorie
            </ThemedText>
            <ThemedText style={styles.productCount}>
              {featuredProducts.length} produits disponibles
            </ThemedText>
          </View>
        </View>

        {/* Produits en vedette */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Produits en vedette</ThemedText>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push(`/categories/${slug}/products`)}
              >
                <ThemedText style={styles.viewAllText}>Voir tout</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          </View>
        )}

        {/* Actions rapides */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Actions rapides</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push(`/categories/${slug}/products`)}
            >
              <Ionicons name="grid-outline" size={24} color="#4CAF50" />
              <ThemedText style={styles.actionTitle}>Voir tous les produits</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Parcourir la collection complète</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/products')}
            >
              <Ionicons name="search-outline" size={24} color="#4CAF50" />
              <ThemedText style={styles.actionTitle}>Rechercher</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Trouver un produit spécifique</ThemedText>
            </TouchableOpacity>
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
  heroContainer: {
    height: 300,
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
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
    paddingVertical: 30,
    zIndex: 1,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A3C2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 16,
    color: '#4B6254',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  productCount: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
  productsContainer: {
    paddingHorizontal: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#81C784',
    textAlign: 'center',
    lineHeight: 16,
  },
});
