import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  badge?: number;
}

function NavItem({ icon, label, isActive = false, onPress, badge }: NavItemProps) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isActive ? '#FFFFFF' : '#81C784'} 
        />
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{badge}</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={[styles.navLabel, isActive && styles.activeLabel]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function ModernBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { 
      icon: 'home' as const, 
      label: 'Home', 
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
      icon: 'heart-outline' as const, 
      label: 'Favoris', 
      route: '/(tabs)/favorites',
      iconActive: 'heart' as const,
      badge: 2
    },
    { 
      icon: 'bag-outline' as const, 
      label: 'Panier', 
      route: '/(tabs)/cart',
      iconActive: 'bag' as const,
      badge: 3
    },
    { 
      icon: 'person-outline' as const, 
      label: 'Profil', 
      route: '/(tabs)/profile',
      iconActive: 'person' as const
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ThemedView style={styles.container}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          const iconName = isActive ? item.iconActive : item.icon;
          
          return (
            <NavItem
              key={item.route}
              icon={iconName}
              label={item.label}
              isActive={isActive}
              badge={item.badge}
              onPress={() => router.push(item.route)}
            />
          );
        })}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 15,
    // Effet de courbe pour le wrapper
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 40, // Très incurvé
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    // Effet flottant très prononcé
    marginHorizontal: 12,
    marginBottom: 12,
    // Forme de pill parfaite
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    // Effet de courbe supplémentaire
    minHeight: 80,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
    // Effet de courbe pour l'élément actif
    transform: [{ scale: 1 }],
  },
  activeIconContainer: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.1 }],
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF7043',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: 10,
    color: '#81C784',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
