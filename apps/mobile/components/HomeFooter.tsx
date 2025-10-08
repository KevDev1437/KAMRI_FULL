import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeFooter() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.brand}>KAMRI</ThemedText>
        <ThemedText style={styles.tagline}>
          Votre destination mode préférée
        </ThemedText>
        
        {/* Social links */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <ThemedText style={styles.socialText}>📘</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <ThemedText style={styles.socialText}>📷</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <ThemedText style={styles.socialText}>🐦</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.copyright}>
          © 2024 KAMRI. Tous droits réservés.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  content: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialText: {
    fontSize: 18,
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
