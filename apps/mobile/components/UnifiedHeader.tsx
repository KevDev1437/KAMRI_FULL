import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFilter } from '../contexts/FilterContext';
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
  '/categories': {
    title: 'Catégories',
    icon: 'list-outline',
    showSearch: true,
    showActions: true,
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
  const { isAuthenticated, user, login } = useAuth();
  const { toggleFilters } = useFilter();

  // Détection de la page active
  const getPageConfig = () => {
    // Recherche exacte d'abord
    if (pageConfig[pathname as keyof typeof pageConfig]) {
      return pageConfig[pathname as keyof typeof pageConfig];
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
              <View style={styles.actionBadge}>
                <ThemedText style={styles.badgeText}>2</ThemedText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Ionicons name="bag-outline" size={20} color="#4CAF50" />
              <View style={styles.actionBadge}>
                <ThemedText style={styles.badgeText}>3</ThemedText>
              </View>
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
          login({ firstName: 'Ulrich', lastName: 'Kevin', email: 'test@test.com' });
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
