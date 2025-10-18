import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFilter } from '../contexts/FilterContext';
import { apiClient } from '../lib/api';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Configuration des pages
const pageConfig = {
  '/': {
    title: 'Accueil',
    icon: 'home-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/': {
    title: 'Accueil',
    icon: 'home-outline',
    showSearch: true,
    showActions: true,
  },
  '/products': {
    title: 'Produits',
    icon: 'cube-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/products': {
    title: 'Produits',
    icon: 'cube-outline',
    showSearch: true,
    showActions: true,
  },
  '/product/': {
    title: 'Produits',
    icon: 'cube-outline',
    showSearch: true,
    showActions: true,
    showBackButton: false,
  },
  '/categories': {
    title: 'Catégories',
    icon: 'list-outline',
    showSearch: true,
    showActions: true,
  },
  '/categories/': {
    title: 'Catégories',
    icon: 'list-outline',
    showSearch: true,
    showActions: true,
    showBackButton: true,
    showBreadcrumb: true,
  },
  '/(tabs)/categories': {
    title: 'Catégories',
    icon: 'list-outline',
    showSearch: true,
    showActions: true,
  },
  '/contact': {
    title: 'Contact',
    icon: 'call-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/contact': {
    title: 'Contact',
    icon: 'call-outline',
    showSearch: true,
    showActions: true,
  },
  '/compte': {
    title: 'Compte',
    icon: 'person-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/compte': {
    title: 'Compte',
    icon: 'person-outline',
    showSearch: true,
    showActions: true,
  },
  '/profile-info': {
    title: 'Mes Informations',
    icon: 'person-circle-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/profile-info': {
    title: 'Mes Informations',
    icon: 'person-circle-outline',
    showSearch: true,
    showActions: true,
  },
  '/favorites': {
    title: 'Favoris',
    icon: 'heart-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/favorites': {
    title: 'Favoris',
    icon: 'heart-outline',
    showSearch: true,
    showActions: true,
  },
  '/cart': {
    title: 'Panier',
    icon: 'bag-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/cart': {
    title: 'Panier',
    icon: 'bag-outline',
    showSearch: true,
    showActions: true,
  },
  '/promotions': {
    title: 'Promotions',
    icon: 'pricetag-outline',
    showSearch: true,
    showActions: true,
  },
  '/(tabs)/promotions': {
    title: 'Promotions',
    icon: 'pricetag-outline',
    showSearch: true,
    showActions: true,
  },
};

export default function UnifiedHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toggleFilters } = useFilter();
  
  // États pour les compteurs réels
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Détection de la page active
  const getPageConfig = () => {
    // Recherche exacte d'abord
    if (pageConfig[pathname as keyof typeof pageConfig]) {
      return pageConfig[pathname as keyof typeof pageConfig];
    }
    
    // Logique spéciale pour les pages de détails de produits
    if (pathname.startsWith('/product/')) {
      return pageConfig['/product/'];
    }
    
    // Logique spéciale pour les pages de catégories
    if (pathname.startsWith('/categories/')) {
      return pageConfig['/categories/'];
    }
    
    // Recherche par correspondance partielle
    for (const [route, config] of Object.entries(pageConfig)) {
      if (pathname.startsWith(route)) {
        return config;
      }
    }
    
    // Configuration par défaut
    return {
      title: 'KAMRI',
      icon: 'home-outline',
      showSearch: true,
      showActions: true,
    };
  };

  const currentConfig = getPageConfig();

  // Charger les compteurs réels
  const loadCounters = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavoritesCount(0);
      setCartCount(0);
      return;
    }

    try {
      // Charger les favoris
      const favoritesResponse = await apiClient.getWishlist();
      if (favoritesResponse.data) {
        const favoritesData = favoritesResponse.data;
        setFavoritesCount(Array.isArray(favoritesData) ? favoritesData.length : 0);
      }
      
      // Charger le panier
      const cartResponse = await apiClient.getCart();
      if (cartResponse.data) {
        const cartData = cartResponse.data;
        const cartItems = Array.isArray(cartData) ? cartData : [];
        const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalQuantity);
      }
    } catch (error) {
      console.error('❌ [HEADER] Erreur lors du chargement des compteurs:', error);
      setFavoritesCount(0);
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  // Recharger les compteurs quand l'utilisateur change
  useEffect(() => {
    loadCounters();
  }, [loadCounters]);

  // Recharger les compteurs quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      loadCounters();
    }, [loadCounters])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.header}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Barre de recherche (conditionnelle) */}
        {currentConfig.showSearch ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#81C784" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des produits..."
              placeholderTextColor="#81C784"
            />
          </View>
        ) : (
          <View style={styles.spacer} />
        )}

        {/* Bouton de connexion */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            if (isAuthenticated) {
              setShowUserMenu(true);
            } else {
              setShowAuthModal(true);
            }
          }}
        >
          {isAuthenticated ? (
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'K'}
              </ThemedText>
            </View>
          ) : (
            <Ionicons name="log-in-outline" size={22} color="#4CAF50" />
          )}
        </TouchableOpacity>
      </ThemedView>

      {/* Ligne des actions (conditionnelle) */}
      {currentConfig.showActions && (
        <ThemedView style={styles.actionsRow}>
          <View style={styles.titleButton}>
            <Ionicons name={currentConfig.icon as any} size={20} color="#4CAF50" />
            <ThemedText style={styles.titleButtonText}>{currentConfig.title}</ThemedText>
          </View>
          
          {/* Étiquette "Détails" pour les pages de détails de produits */}
          {pathname.startsWith('/product/') && (
            <View style={styles.detailsButton}>
              <Ionicons name="information-circle-outline" size={16} color="#81C784" />
              <ThemedText style={styles.detailsButtonText}>Détails</ThemedText>
            </View>
          )}

          {/* Étiquette de catégorie pour les pages de catégories */}
          {pathname.startsWith('/categories/') && (() => {
            const slug = pathname.split('/')[2] || '';
            const categoryName = decodeURIComponent(slug)
              .replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            
            return (
              <View style={styles.categoryButton}>
                <Ionicons name="list-outline" size={16} color="#81C784" />
                <ThemedText style={styles.categoryButtonText}>
                  {categoryName || 'Catégorie'}
                </ThemedText>
              </View>
            );
          })()}

          {/* Bouton Filtres (pour les pages qui en ont besoin) */}
          {(pathname.includes('/products') || pathname.includes('/promotions')) && (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={toggleFilters}
            >
              <Ionicons name="filter-outline" size={18} color="#4CAF50" />
              <ThemedText style={styles.filterButtonText}>Filtres</ThemedText>
            </TouchableOpacity>
          )}

          {/* Favoris et Panier */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/favorites')}
            >
              <Ionicons name="heart-outline" size={20} color="#4CAF50" />
              {favoritesCount > 0 && (
                <View style={styles.actionBadge}>
                  <ThemedText style={styles.badgeText}>{favoritesCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Ionicons name="bag-outline" size={20} color="#4CAF50" />
              {cartCount > 0 && (
                <View style={styles.actionBadge}>
                  <ThemedText style={styles.badgeText}>{cartCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}
      
      {/* Menu utilisateur */}
      <UserMenu
        visible={showUserMenu}
        onClose={() => setShowUserMenu(false)}
      />

      {/* Modal d'authentification */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setShowAuthModal(false);
          // La connexion est déjà gérée par le contexte AuthContext
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
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
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    marginLeft: 8,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#81C784',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    marginLeft: 8,
    gap: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#81C784',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#E8F5E8',
    gap: 4,
    marginRight: 8,
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
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  },
});
