import { Ionicons } from '@expo/vector-icons';
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
          color={isActive ? '#FFFFFF' : '#9CA3AF'} 
        />
      </View>
      <ThemedText style={[styles.navLabel, isActive && styles.activeLabel]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function BottomNavigation() {
  return (
    <View style={styles.wrapper}>
      <ThemedView style={styles.container}>
        <NavItem 
          icon="home" 
          label="Home" 
          isActive={true}
        />
        
        <NavItem 
          icon="grid-outline" 
          label="Products" 
        />
        
        <NavItem 
          icon="bag-outline" 
          label="Cart" 
        />
        
        <NavItem 
          icon="person-outline" 
          label="Profile" 
        />
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
    backgroundColor: '#1E88E5',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#1E88E5',
    fontWeight: '600',
  },
});
