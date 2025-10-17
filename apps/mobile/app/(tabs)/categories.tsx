import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';
import { apiClient, Product } from '../../lib/api';

const { width } = Dimensions.get('window');

// Utiliser les icônes et couleurs du backend
const getCategoryConfig = (category: any) => {
  return {
    icon: category.icon || '🛍️',
    color: category.color || '#4CAF50'
  };
};

const trendingItems = [
  {
    id: 1,
    title: 'Mode Éthique',
    subtitle: 'Vêtements durables',
    icon: '🌱',
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Tech Éco',
    subtitle: 'Électronique verte',
    icon: '🔋',
    color: '#2196F3'
  },
  {
    id: 3,
    title: 'Maison Bio',
    subtitle: 'Déco naturelle',
    icon: '🏡',
    color: '#9C27B0'
  }
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularScrollIndex, setPopularScrollIndex] = useState(0);
  const [trendingScrollIndex, setTrendingScrollIndex] = useState(0);
  const popularFlatListRef = useRef<FlatList>(null);
  const trendingFlatListRef = useRef<FlatList>(null);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('📂 [CATEGORIES-MOBILE] Début du chargement des catégories');
        setLoading(true);
        
        // Charger les catégories depuis l'API
        const categoriesResponse = await apiClient.getCategories();
        console.log('📂 [CATEGORIES-MOBILE] Réponse API catégories:', categoriesResponse);
        
        if (categoriesResponse.data) {
          const backendData = categoriesResponse.data.data || categoriesResponse.data;
          const categoriesList = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORIES-MOBILE] Catégories chargées:', categoriesList.length);
          
          // Charger les produits pour compter par catégorie
          const productsResponse = await apiClient.getProducts();
          if (productsResponse.data) {
            const backendProductsData = productsResponse.data.data || productsResponse.data;
            const products = Array.isArray(backendProductsData) ? backendProductsData : [];
            console.log('🛍️ [CATEGORIES-MOBILE] Produits chargés:', products.length);
            
            // Enrichir les catégories avec le nombre de produits et la configuration
            const enrichedCategories = categoriesList.map(category => {
              const productCount = products.filter((product: Product) => 
                product.category?.name === category.name
              ).length;
              
              const config = getCategoryConfig(category);
              
              return {
                id: category.id,
                name: category.name,
                count: productCount,
                color: config.color,
                icon: config.icon
              };
            });
            
            console.log('📂 [CATEGORIES-MOBILE] Catégories enrichies:', enrichedCategories);
            setCategories(enrichedCategories);
          } else {
            // Si pas de produits, afficher quand même les catégories avec 0 produits
            const enrichedCategories = categoriesList.map(category => {
              const config = getCategoryConfig(category);
              
              return {
                id: category.id,
                name: category.name,
                count: 0,
                color: config.color,
                icon: config.icon
              };
            });
            
            setCategories(enrichedCategories);
          }
        } else {
          console.log('⚠️ [CATEGORIES-MOBILE] Pas de données dans la réponse');
          setCategories([]);
        }
      } catch (error) {
        console.error('❌ [CATEGORIES-MOBILE] Erreur lors du chargement des catégories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
        console.log('📂 [CATEGORIES-MOBILE] Chargement terminé');
      }
    };

    loadCategories();
  }, []);

  // Auto-scroll pour les catégories populaires - adaptatif selon le nombre de catégories affichées
  useEffect(() => {
    const interval = setInterval(() => {
      if (popularFlatListRef.current && categories.length > 0) {
        const popularCategories = categories.slice(0, 4); // Seulement les 4 premières catégories
        const totalPages = Math.ceil(popularCategories.length / 2); // 2 catégories par page
        setPopularScrollIndex((prev) => (prev + 1) % totalPages);
        popularFlatListRef.current.scrollToIndex({
          index: (popularScrollIndex + 1) % totalPages,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [popularScrollIndex, categories.length]);

  // Auto-scroll pour les tendances
  useEffect(() => {
    const interval = setInterval(() => {
      if (trendingFlatListRef.current && trendingItems.length > 2) {
        setTrendingScrollIndex((prev) => (prev + 1) % trendingItems.length);
        trendingFlatListRef.current.scrollToIndex({
          index: (trendingScrollIndex + 1) % trendingItems.length,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [trendingScrollIndex, trendingItems.length]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonctions de navigation comme sur le web
  const handleCategoryClick = (category: any) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    console.log('📂 [CATEGORIES-MOBILE] Navigation vers catégorie:', slug);
    router.push(`/categories/${slug}`);
  };

  const handleViewAllClick = (category: any) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-');
    console.log('🛍️ [CATEGORIES-MOBILE] Navigation vers produits:', slug);
    router.push(`/categories/${slug}/products`);
  };

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryClick(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <ThemedText style={styles.categoryEmoji}>{item.icon}</ThemedText>
      </View>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
      <ThemedText style={styles.categoryCount}>{item.count} produits</ThemedText>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.trendingCard, { backgroundColor: item.color + '10' }]}>
      <ThemedText style={styles.trendingIcon}>{item.icon}</ThemedText>
      <ThemedText style={styles.trendingTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.trendingSubtitle}>{item.subtitle}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Style comme l'accueil */}
        <View style={styles.heroContainer}>
          {/* Background gradient */}
          <LinearGradient
            colors={['#EAF3EE', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          />
          
          {/* Content Grid - Two columns like web */}
          <View style={styles.heroContentGrid}>
            {/* Left Column - Text Content */}
            <View style={styles.heroTextColumn}>
              <ThemedText style={styles.heroTitle}>
                Explorez nos catégories
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Découvrez une sélection soigneusement organisée de produits pour tous vos besoins
              </ThemedText>
              
              {/* Barre de recherche intégrée */}
              <View style={styles.heroSearchContainer}>
                <Ionicons name="search" size={20} color="#4CAF50" style={styles.heroSearchIcon} />
                <ThemedText style={styles.heroSearchPlaceholder}>Rechercher une catégorie...</ThemedText>
              </View>
            </View>
            
            {/* Right Column - Categories Preview */}
            <View style={styles.heroImageColumn}>
              <View style={styles.heroImageContainer}>
                <View style={styles.categoriesPreview}>
                  <View style={styles.previewCard}>
                    <ThemedText style={styles.previewEmoji}>👗</ThemedText>
                    <ThemedText style={styles.previewLabel}>Mode</ThemedText>
                  </View>
                  <View style={styles.previewCard}>
                    <ThemedText style={styles.previewEmoji}>📱</ThemedText>
                    <ThemedText style={styles.previewLabel}>Tech</ThemedText>
                  </View>
                  <View style={styles.previewCard}>
                    <ThemedText style={styles.previewEmoji}>🏠</ThemedText>
                    <ThemedText style={styles.previewLabel}>Maison</ThemedText>
                  </View>
                  <View style={styles.previewCard}>
                    <ThemedText style={styles.previewEmoji}>⚽</ThemedText>
                    <ThemedText style={styles.previewLabel}>Sport</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Grille des catégories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Toutes les catégories</ThemedText>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
              <ThemedText style={styles.loadingTitle}>Chargement des catégories...</ThemedText>
              <ThemedText style={styles.loadingSubtitle}>Veuillez patienter</ThemedText>
            </View>
          ) : filteredCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => handleCategoryClick(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <ThemedText style={styles.categoryEmoji}>{category.icon}</ThemedText>
                  </View>
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                  <ThemedText style={styles.categoryCount}>{category.count} produits</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>📂</ThemedText>
              <ThemedText style={styles.emptyTitle}>Aucune catégorie trouvée</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {searchQuery ? 'Essayez un autre terme de recherche' : 'Les catégories seront disponibles bientôt'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Catégories Populaires */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔥 Catégories populaires</ThemedText>
          <FlatList
            ref={popularFlatListRef}
            data={categories.slice(0, 4)}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.popularCard}
                onPress={() => handleCategoryClick(item)}
              >
                <View style={[styles.popularIcon, { backgroundColor: item.color + '20' }]}>
                  <ThemedText style={styles.popularEmoji}>{item.icon}</ThemedText>
                </View>
                <ThemedText style={styles.popularName}>{item.name}</ThemedText>
                <ThemedText style={styles.popularCount}>{item.count} produits</ThemedText>
                <View style={styles.popularBadge}>
                  <ThemedText style={styles.popularBadgeText}>Populaire</ThemedText>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularContainer}
            onScrollToIndexFailed={(info) => {
              // Fallback si l'index n'est pas trouvé
              setTimeout(() => {
                if (popularFlatListRef.current) {
                  popularFlatListRef.current.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                }
              }, 100);
            }}
          />
        </View>

        {/* Section Tendances */}
        <View style={[styles.section, styles.trendingSection]}>
          <ThemedText style={styles.sectionTitle}>🌟 Tendances du moment</ThemedText>
          <FlatList
            ref={trendingFlatListRef}
            data={trendingItems}
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContainer}
            onScrollToIndexFailed={(info) => {
              // Fallback si l'index n'est pas trouvé
              setTimeout(() => {
                if (trendingFlatListRef.current) {
                  trendingFlatListRef.current.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                }
              }, 100);
            }}
          />
          
          {/* Bouton Découvrir toutes les tendances */}
          <TouchableOpacity style={styles.discoverButton}>
            <ThemedText style={styles.discoverButtonText}>Découvrir toutes les tendances</ThemedText>
          </TouchableOpacity>
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
  // Hero Section Styles
  heroContainer: {
    height: 500,
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
  heroContentGrid: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 30,
    zIndex: 1,
  },
  heroTextColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 15,
  },
  heroImageColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A3C2E',
    marginBottom: 10,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#4B6254',
    marginBottom: 16,
    lineHeight: 18,
  },
  heroSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroSearchIcon: {
    marginRight: 8,
  },
  heroSearchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  heroImageContainer: {
    height: 200,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 60,
  },
  previewEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  trendingSection: {
    marginTop: 20, // Espacement supplémentaire pour la section tendances
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  trendingContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16, // Espacement en bas des cartes tendances
  },
  trendingCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 4,
  },
  trendingSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Catégories Populaires Styles
  popularContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16, // Espacement en bas des cartes populaires
  },
  popularCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  popularIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularEmoji: {
    fontSize: 20,
  },
  popularName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 4,
  },
  popularCount: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Bouton Découvrir
  discoverButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 24, // Espacement supplémentaire avant le bouton
    marginBottom: 16, // Espacement après le bouton
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // États de chargement et d'erreur
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
  },
});
