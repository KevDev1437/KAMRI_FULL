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

export default function PromotionsPage() {
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
    const fetchProducts = async () => {
      try {
        console.log('🔄 [PromotionsPage] Début du chargement des produits...');
        setIsLoading(true);
        
        console.log('🌐 [PromotionsPage] Appel API vers: http://localhost:3001/api/web/products');
        // Appel API vers le backend
        const response = await fetch('http://localhost:3001/api/web/products', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('📡 [PromotionsPage] Réponse reçue:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 [PromotionsPage] Données reçues:', data);
          console.log('📊 [PromotionsPage] Nombre de produits:', data.data?.length || 0);
          
          // Adapter les données du backend au format frontend
          const adaptedProducts = data.data.map((product: any) => {
            // Utiliser directement le nom de la catégorie du backend (nos 7 catégories fixes)
            const categoryName = product.category?.name || 'Mode';
            
            console.log('📦 [PromotionsPage] Produit:', product.name, 'Catégorie:', categoryName);
            
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              category: categoryName,
              rating: 4.5, // Valeur par défaut
              reviews: Math.floor(Math.random() * 100), // Valeur aléatoire
              badge: product.originalPrice ? 'Promo' : null,
              brand: 'Fake Store', // Valeur par défaut
            };
          });
          
          console.log('✅ [PromotionsPage] Produits adaptés:', adaptedProducts.length);
          setProducts(adaptedProducts);
          setFilteredProducts(adaptedProducts);
        } else {
          console.error('❌ [PromotionsPage] Erreur API:', response.status, response.statusText);
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('💥 [PromotionsPage] Erreur lors du chargement des produits:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        console.log('🏁 [PromotionsPage] Fin du chargement');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrage des produits - SEULEMENT les produits en promotion
  useEffect(() => {
    let filtered = products.filter(product => product.badge === 'promo');

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
        <h1 className="text-3xl font-bold text-[#424242] mb-8 text-center">🔥 Promotions</h1>

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
                <p className="text-gray-600">Chargement des promotions...</p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#424242]">
                    {filteredProducts.length} produits en promotion trouvés
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
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-[#424242] mb-2">
                      Aucune promotion trouvée
                    </h2>
                    <p className="text-lg text-[#81C784]">
                      Essayez de modifier vos critères de recherche
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
