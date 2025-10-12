import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomePageHeader() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, user, login } = useAuth();
  
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

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#81C784" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            placeholderTextColor="#81C784"
          />
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            if (isAuthenticated) {
              router.push('/(tabs)/profile-info');
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

      {/* Ligne des actions */}
      <ThemedView style={styles.actionsRow}>
        <View style={styles.titleButton}>
          <Ionicons name="home-outline" size={20} color="#4CAF50" />
          <ThemedText style={styles.titleButtonText}>Accueil</ThemedText>
        </View>

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
  homeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeTitle: {
    fontSize: 16,
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
});
