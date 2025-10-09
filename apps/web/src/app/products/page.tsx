'use client';

import { useEffect, useState } from 'react';
import CategoryTabs from '../../components/CategoryTabs';
import ModernHeader from '../../components/ModernHeader';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';

// Mock data pour les produits
const mockProducts = [
  { 
    id: '1', 
    name: 'T-Shirt Premium', 
    price: 29.99, 
    originalPrice: 39.99,
    image: null, 
    category: 'mode',
    rating: 4.5,
    reviews: 128,
    badge: 'tendance',
    brand: 'KAMRI'
  },
  { 
    id: '2', 
    name: 'Jean Slim Fit', 
    price: 59.99, 
    originalPrice: null,
    image: null, 
    category: 'mode',
    rating: 4.2,
    reviews: 89,
    badge: 'nouveau',
    brand: 'KAMRI'
  },
  { 
    id: '3', 
    name: 'Smartphone Pro', 
    price: 899.99, 
    originalPrice: 999.99,
    image: null, 
    category: 'technologie',
    rating: 4.8,
    reviews: 256,
    badge: 'promo',
    brand: 'TechBrand'
  },
  { 
    id: '4', 
    name: 'Veste Denim', 
    price: 79.99, 
    originalPrice: null,
    image: null, 
    category: 'mode',
    rating: 4.3,
    reviews: 67,
    badge: null,
    brand: 'KAMRI'
  },
  { 
    id: '5', 
    name: 'Laptop Gaming', 
    price: 1299.99, 
    originalPrice: 1499.99,
    image: null, 
    category: 'technologie',
    rating: 4.7,
    reviews: 189,
    badge: 'promo',
    brand: 'GameTech'
  },
  { 
    id: '6', 
    name: 'Sac à Main', 
    price: 49.99, 
    originalPrice: null,
    image: null, 
    category: 'accessoires',
    rating: 4.1,
    reviews: 45,
    badge: 'nouveau',
    brand: 'KAMRI'
  },
  { 
    id: '7', 
    name: 'Parfum Élégant', 
    price: 89.99, 
    originalPrice: 119.99,
    image: null, 
    category: 'beaute',
    rating: 4.6,
    reviews: 203,
    badge: 'promo',
    brand: 'Luxury'
  },
  { 
    id: '8', 
    name: 'Chaise Design', 
    price: 199.99, 
    originalPrice: null,
    image: null, 
    category: 'maison',
    rating: 4.4,
    reviews: 78,
    badge: 'tendance',
    brand: 'HomeStyle'
  },
];

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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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

            {/* Résultats */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Message si aucun produit */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-[#424242] mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-[#81C784]">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}