import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function BottomNavigation() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.navItem}>
        <ThemedText style={styles.navIcon}>🏠</ThemedText>
        <ThemedText style={styles.navLabel}>Home</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <ThemedText style={styles.navIcon}>🛍️</ThemedText>
        <ThemedText style={styles.navLabel}>Products</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <ThemedText style={styles.navIcon}>🛒</ThemedText>
        <ThemedText style={styles.navLabel}>Cart</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <ThemedText style={styles.navIcon}>👤</ThemedText>
        <ThemedText style={styles.navLabel}>Profile</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#212121',
    fontWeight: '500',
  },
});
