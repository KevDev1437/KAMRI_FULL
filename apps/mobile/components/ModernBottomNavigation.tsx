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
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  activeIconContainer: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.1 }],
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
