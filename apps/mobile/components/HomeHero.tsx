import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeHero() {
  return (
    <ThemedView style={styles.container}>
      {/* Background gradient */}
      <ThemedView style={styles.background} />
      
      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Découvrez les tendances du moment
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Collection exclusive de vêtements et accessoires
        </ThemedText>
        
        <TouchableOpacity style={styles.ctaButton}>
          <ThemedText style={styles.ctaText}>Explorer maintenant</ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        <ThemedView style={styles.imagePlaceholder}>
          <ThemedText style={styles.imageText}>Image de modèle</ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    position: 'relative',
    backgroundColor: '#EAF3EE',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EAF3EE',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A3C2E',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B6254',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#2F6F4E',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#2F6F4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  imageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 0,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#4B6254',
    fontSize: 14,
    fontWeight: '500',
  },
});
