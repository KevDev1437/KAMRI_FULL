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
}

function NavItem({ icon, label, isActive = false, onPress }: NavItemProps) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isActive ? '#FFFFFF' : '#81C784'} 
        />
      </View>
      <ThemedText style={[styles.navLabel, isActive && styles.activeLabel]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: 'home' as const, label: 'Home', route: '/(tabs)/' },
    { icon: 'grid-outline' as const, label: 'Products', route: '/(tabs)/products' },
    { icon: 'bag-outline' as const, label: 'Cart', route: '/(tabs)/cart' },
    { icon: 'person-outline' as const, label: 'Profile', route: '/(tabs)/explore' },
  ];

  return (
    <View style={styles.wrapper}>
      <ThemedView style={styles.container}>
        {navItems.map((item) => (
          <NavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.route}
            onPress={() => router.push(item.route)}
          />
        ))}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeIconContainer: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#81C784',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
