import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeHeader() {
  return (
    <ThemedView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <ThemedText style={styles.logo}>KAMRI</ThemedText>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des produits..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Icônes de navigation */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <ThemedText style={styles.iconText}>👤</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <ThemedText style={styles.iconText}>🛒</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  searchContainer: {
    flex: 2,
    marginHorizontal: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    color: '#212121',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 20,
    color: '#212121',
  },
});
