import { ScrollView, StyleSheet, View } from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import HomeFooter from '../../components/HomeFooter';
import HomeHeader from '../../components/HomeHeader';
import HomeHero from '../../components/HomeHero';
import ProductGrid from '../../components/ProductGrid';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHero />
        <ProductGrid />
        <HomeFooter />
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    marginTop: 100, // Space for fixed header
    paddingBottom: 0,
  },
});