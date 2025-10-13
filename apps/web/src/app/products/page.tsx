'use client';

import { useEffect, useState } from 'react';
import CategoryTabs from '../../components/CategoryTabs';
import HomeFooter from '../../components/HomeFooter';
import ModernHeader from '../../components/ModernHeader';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';

// TODO: Remplacer par des données réelles du backend
const mockProducts: Product[] = [];

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  rating: number;
  reviews: number;
  badge: string | null;
  brand: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Chargement des produits
  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Simulation d'appel API - pour l'instant retourne un tableau vide
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts([]);
        setFilteredProducts([]);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtre par catégorie
    if (selectedCategory !== 'tous') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Tri
    switch (sortBy) {
      case 'prix_croissant':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'prix_decroissant':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nouveautes':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'note':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // populaire
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar avec filtres */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ProductFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Catégories */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* État de chargement */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-600">Chargement des produits...</p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#424242]">
                    {filteredProducts.length} produits trouvés
                  </h2>
                  <button 
                    className="lg:hidden bg-[#4CAF50] text-white px-4 py-2 rounded-lg"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filtres
                  </button>
                </div>

                {/* Grille de produits */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-[#424242] mb-2">
                      Aucun produit disponible
                    </h3>
                    <p className="text-[#81C784]">
                      Aucun produit n'est disponible pour le moment
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <HomeFooter />
    </div>
  );
}