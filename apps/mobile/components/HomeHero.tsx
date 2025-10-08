import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function HomeHero() {
  return (
    <ThemedView style={styles.container}>
      {/* Gradient background effect */}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    position: 'relative',
    backgroundColor: '#1E88E5',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E88E5',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: '#FF7043',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
