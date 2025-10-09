import BestOffers from '../components/BestOffers';
import HomeFooter from '../components/HomeFooter';
import HomeHeader from '../components/HomeHeader';
import HomeHero from '../components/HomeHero';
import ProductGrid from '../components/ProductGrid';
import TopSales from '../components/TopSales';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <HomeHeader />
      <HomeHero />
      <ProductGrid />
      <TopSales />
      <BestOffers />
      <HomeFooter />
    </div>
  );
}