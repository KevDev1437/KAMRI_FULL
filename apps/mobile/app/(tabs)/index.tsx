import { ScrollView, StyleSheet, View } from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import HomeFooter from '../../components/HomeFooter';
import HomeHeader from '../../components/HomeHeader';
import HomeHero from '../../components/HomeHero';
import ProductGrid from '../../components/ProductGrid';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHeader />
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
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
});