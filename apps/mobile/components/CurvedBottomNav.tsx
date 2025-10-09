import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';



export default function CurvedBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const scaleAnim = useState(new Animated.Value(1))[0];

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
      label: 'Profil', 
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

  return (
    <View style={styles.wrapper}>
      {/* Fond de la barre principale */}
      <View style={styles.mainBar}>
        {/* Découpe pour le bouton principal */}
        <View style={styles.cutout} />
      </View>

      {/* Bouton principal flottant - Page active */}
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
              color="#9CA3AF" 
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
    color: '#9CA3AF',
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
});
