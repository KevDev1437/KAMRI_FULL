'use client';

import { ArrowRight, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeFooter from '../../../../components/HomeFooter';
import ModernHeader from '../../../../components/ModernHeader';
import ProductFilters from '../../../../components/ProductFilters';
import { apiClient, Category, Product } from '../../../../lib/api';

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('populaire');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]); // ✅ Augmenté pour les voitures
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadCategoryProducts = async () => {
      try {
        setLoading(true);
        
        // Décoder le slug pour gérer les caractères spéciaux
        const decodedSlug = decodeURIComponent(slug);
        
        // Charger toutes les catégories pour trouver celle correspondant au slug
        const categoriesResponse = await apiClient.getCategories();
        console.log('🔍 [CATEGORY-PRODUCTS] Response from API:', categoriesResponse);
        
        if (categoriesResponse.data) {
          // L'API backend retourne { data: categories, message: '...' }
          // Notre API client retourne { data: { data: categories, message: '...' } }
          const backendData = categoriesResponse.data.data || categoriesResponse.data;
          const categories = Array.isArray(backendData) ? backendData : [];
          console.log('📂 [CATEGORY-PRODUCTS] Categories list:', categories);
          
          // Debug: Afficher les catégories et le slug
          console.log('🔍 [PRODUCTS] Slug recherché (encodé):', slug);
          console.log('🔍 [PRODUCTS] Slug recherché (décodé):', decodedSlug);
          console.log('📂 [PRODUCTS] Catégories disponibles:', categories.map(cat => ({
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/\s+/g, '-')
          })));
          
          // Trouver la catégorie par slug
          const foundCategory = categories.find(cat => 
            cat.name.toLowerCase().replace(/\s+/g, '-') === decodedSlug
          );
          
          console.log('✅ [PRODUCTS] Catégorie trouvée:', foundCategory);
          
          if (foundCategory) {
            setCategory(foundCategory);
            
            // Charger tous les produits
            const productsResponse = await apiClient.getProducts();
            if (productsResponse.data) {
              // Même logique pour les produits
              const backendProductsData = productsResponse.data.data || productsResponse.data;
              const products = Array.isArray(backendProductsData) ? backendProductsData : [];
              // Filtrer les produits de cette catégorie
              const categoryProducts = products.filter((product) => 
                product.category?.name === foundCategory.name
              );
              setProducts(categoryProducts);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [slug]);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default: // populaire
        filtered.sort((a, b) => b.stock - a.stock);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, sortBy, priceRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-semibold text-[#424242]">Chargement...</h2>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-[#424242] mb-2">Catégorie non trouvée</h2>
            <p className="text-[#81C784] mb-6">Cette catégorie n'existe pas.</p>
            <Link 
              href="/categories" 
              className="bg-[#4CAF50] text-white px-6 py-3 rounded-lg hover:bg-[#45a049] transition-colors"
            >
              Retour aux catégories
            </Link>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-[#4CAF50] hover:text-[#45a049]">Accueil</Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link href="/categories" className="text-[#4CAF50] hover:text-[#45a049]">Catégories</Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link href={`/categories/${slug}`} className="text-[#4CAF50] hover:text-[#45a049]">{category.name}</Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Produits</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la catégorie */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-[#424242] mb-2">
            {category.name}
          </h1>
          <p className="text-[#81C784]">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar avec filtres */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
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
            {/* Barre de recherche et contrôles */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Barre de recherche */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher dans cette catégorie..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Contrôles */}
                <div className="flex items-center space-x-4">
                  {/* Bouton filtres mobile */}
                  <button 
                    className="lg:hidden bg-[#4CAF50] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtres</span>
                  </button>

                  {/* Mode d'affichage */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats */}
            {loading ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-[#424242] mb-2">
                  Chargement des produits...
                </h3>
                <p className="text-[#81C784]">
                  Veuillez patienter
                </p>
              </div>
            ) : (
              <>
                {/* Grille de produits */}
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {product.badge && (
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[#4CAF50] text-white">
                              {product.badge}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="mb-2">
                            <span className="text-sm text-[#81C784] font-medium">
                              {product.supplier?.name || 'N/A'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-4">
                            <p className="text-2xl font-bold text-[#4CAF50]">
                              {product.price.toFixed(2)}€
                            </p>
                            {product.originalPrice && (
                              <p className="text-lg text-[#9CA3AF] line-through">
                                {product.originalPrice.toFixed(2)}€
                              </p>
                            )}
                          </div>
                          <div className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold text-center">
                            Voir détails
                          </div>
                        </div>
                      </Link>
                    </div>
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
              </>
            )}
          </div>
        </div>
      </div>
      
      <HomeFooter />
    </div>
  );
}
