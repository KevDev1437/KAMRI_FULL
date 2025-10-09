import { StyleSheet, View } from 'react-native';
import ModernBottomNavigation from '../../components/ModernBottomNavigation';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.icon}>❤️</ThemedText>
        <ThemedText style={styles.title}>Mes Favoris</ThemedText>
        <ThemedText style={styles.subtitle}>
          Vos produits favoris apparaîtront ici
        </ThemedText>
      </ThemedView>
      <ModernBottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
});
