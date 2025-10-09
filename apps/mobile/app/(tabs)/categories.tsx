import { ScrollView, StyleSheet, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>Catégories</ThemedText>
          <ThemedText style={styles.subtitle}>
            Découvrez nos différentes catégories de produits
          </ThemedText>
        </View>
        
        <HomeFooter />
      </ScrollView>
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 100, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
