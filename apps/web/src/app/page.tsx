import HomeFooter from '../components/HomeFooter';
import HomeHeader from '../components/HomeHeader';
import HomeHero from '../components/HomeHero';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <HomeHeader />
      <HomeHero />
      <ProductGrid />
      <HomeFooter />
    </div>
  );
}