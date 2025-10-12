import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeHeader() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, user, login } = useAuth();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Logo centré */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Barre de recherche moderne */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#4CAF50" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            placeholderTextColor="#81C784"
          />
        </View>

        {/* Icônes d'action */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/favorites')}
          >
            <Ionicons name="heart-outline" size={24} color="#4CAF50" />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="bag-outline" size={24} color="#4CAF50" />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>3</ThemedText>
            </View>
          </TouchableOpacity>
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
        onRegisterSuccess={() => {
          setShowAuthModal(false);
          login({ firstName: 'Nouveau', lastName: 'Utilisateur', email: 'nouveau@email.com' });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 0, // Pas de marge - fond blanc continu
    borderRadius: 0,
    height: 0,
    
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
    height: 90,
    marginBottom: 2,
    width: '100%',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 300,
    height: 100,
  },
  searchContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
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
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
