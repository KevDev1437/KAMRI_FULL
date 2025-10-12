import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemedText } from './themed-text';



export default function CurvedBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const scaleAnim = useState(new Animated.Value(1))[0];
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<View>(null);

  const navItems = [
    { 
      icon: 'home' as const, 
      label: 'Accueil', 
      route: '/(tabs)/',
      iconActive: 'home' as const
    },
    { 
      icon: 'grid-outline' as const, 
      label: 'Produits', 
      route: '/(tabs)/products',
      iconActive: 'grid' as const
    },
    { 
      icon: 'list-outline' as const, 
      label: 'Catégorie', 
      route: '/(tabs)/categories',
      iconActive: 'list' as const
    },
    { 
      icon: 'call-outline' as const, 
      label: 'Contact', 
      route: '/(tabs)/contact',
      iconActive: 'call' as const
    },
    { 
      icon: 'person-outline' as const, 
      label: 'Compte', 
      route: '/(tabs)/profile',
      iconActive: 'person' as const
    },
  ];

  // Trouver l'élément actif - Normaliser le pathname
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const activeItem = navItems.find(item => 
    normalizedPathname === item.route || 
    normalizedPathname === item.route.replace('/(tabs)', '') ||
    pathname === item.route.replace('/(tabs)', '')
  ) || navItems[0];
  
  console.log('Current pathname:', pathname);
  console.log('Active item:', activeItem);
  console.log('Active icon:', activeItem.iconActive);

  // Animation au changement de page
  useEffect(() => {
    // Animation de scale pour le changement d'icône
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pathname, scaleAnim]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive', 
          onPress: () => {
            logout();
            setShowUserMenu(false);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Fond de la barre principale */}
      <View style={styles.mainBar}>
        {/* Découpe pour le bouton principal */}
        <View style={styles.cutout} />
      </View>

      {/* Bouton principal flottant - Page active */}
      {isAuthenticated ? (
        <View style={styles.mainButton} ref={menuRef}>
          <TouchableOpacity 
            onPress={() => setShowUserMenu(!showUserMenu)}
            style={styles.mainButtonContainer}
          >
            <View style={styles.avatarContainer}>
              <ThemedText style={styles.avatarText}>
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'K'}
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Menu déroulant utilisateur */}
          <Modal
            visible={showUserMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowUserMenu(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowUserMenu(false)}
            >
              <View style={styles.userMenu}>
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>
                    {user?.firstName} {user?.lastName}
                  </ThemedText>
                  <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
                </View>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    router.push('/(tabs)/profile' as any);
                    setShowUserMenu(false);
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#4CAF50" />
                  <ThemedText style={styles.menuItemText}>Mon profil</ThemedText>
                </TouchableOpacity>
                
                <View style={styles.menuSeparator} />
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <ThemedText style={[styles.menuItemText, styles.logoutText]}>Se déconnecter</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      ) : (
        <TouchableOpacity 
          key={activeItem.route}
          style={styles.mainButton}
          onPress={() => router.push(activeItem.route as any)}
        >
          <Animated.View 
            style={[
              styles.mainButtonContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Ionicons 
              name={activeItem.iconActive as any} 
              size={28} 
              color="#4CAF50" 
            />
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Éléments secondaires - Toutes les autres pages */}
      <View style={styles.secondaryNav}>
        {navItems.filter(item => item.route !== activeItem.route).map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.secondaryItem}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons 
              name={item.icon} 
              size={20} 
              color="green" 
            />
            <ThemedText style={styles.secondaryLabel}>{item.label}</ThemedText>
            {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
              <View style={styles.secondaryBadge}>
                <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  mainBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  cutout: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    width: 60,
    height: 20,
    backgroundColor: 'transparent',
    borderRadius: 30,
  },
  mainButton: {
    position: 'absolute',
    bottom: 45,
    left: 30,
    zIndex: 1001,
  },
  mainButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  secondaryNav: {
    position: 'absolute',
    bottom: 12,
    left: 100,
    right: 20,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  secondaryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'relative',
  },
  secondaryLabel: {
    fontSize: 10,
    color: 'green',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  secondaryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF7043',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Menu utilisateur
  avatarContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userMenu: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    paddingVertical: 12,
    marginHorizontal: 20,
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 12,
  },
  logoutText: {
    color: '#EF4444',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
});
