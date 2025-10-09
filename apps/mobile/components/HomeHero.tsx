import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export default function HomeHero() {
  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#EAF3EE', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Content Grid - Two columns like web */}
      <View style={styles.contentGrid}>
        {/* Left Column - Text Content */}
        <View style={styles.textColumn}>
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
        
        {/* Right Column - Model Image */}
        <View style={styles.imageColumn}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/modelo.png')}
              style={styles.modelImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 550,
    position: 'relative',
    marginBottom: 0,
    marginTop: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentGrid: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 30,
    zIndex: 1,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 15,
  },
  imageColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A3C2E',
    marginBottom: 12,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B6254',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modelImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
});
