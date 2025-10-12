import { ScrollView, StyleSheet, View } from 'react-native';
import BestOffers from '../../components/BestOffers';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import HomeHero from '../../components/HomeHero';
import ProductGrid from '../../components/ProductGrid';
import TopSales from '../../components/TopSales';
import UnifiedHeader from '../../components/UnifiedHeader';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <UnifiedHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHero />
        <ProductGrid />
        <TopSales />
        <BestOffers />
        <HomeFooter />
      </ScrollView>
      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
    height: '100%',
    paddingBottom: 120, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    marginTop: -8, // Réduire l'espace entre header et contenu
    paddingTop: 0, // No padding - content starts immediately
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
    marginBottom: 0,
  },
});