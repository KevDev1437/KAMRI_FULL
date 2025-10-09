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
    height: 240,
    position: 'relative',
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    opacity: 0.95,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 28,
    opacity: 0.9,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
