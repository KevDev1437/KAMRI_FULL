
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🛒 [ProductGrid] Ajouter au panier:', product.name);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      console.log('💔 [ProductGrid] Retirer des favoris:', product.name);
      removeFromFavorites(product.id);
    } else {
      console.log('❤️ [ProductGrid] Ajouter aux favoris:', product.name);
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out group border border-[#E8F5E8]">
      <Link href={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="h-56 bg-gradient-to-br from-[#E8F5E8] to-[#81C784]/20 flex items-center justify-center relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('❌ [ProductGrid] Erreur image:', product.image);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('✅ [ProductGrid] Image chargée:', product.image);
              }}
            />
          ) : (
            <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          
          {/* Favorite button */}
          <button 
            onClick={handleFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 ${
              isFavorite(product.id) 
                ? 'bg-[#4CAF50] text-white' 
                : 'bg-white/95 text-[#81C784] hover:text-[#4CAF50]'
            }`}
          >
            <svg className="h-5 w-5" fill={isFavorite(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        {/* Product info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-1 font-['Inter']">{product.name}</h3>
          <p className="text-2xl font-bold text-[#4CAF50] mb-6 font-['Inter']">${product.price}</p>
        </div>
      </Link>
      
      {/* Add to cart button - séparé du lien */}
      <div className="px-6 pb-6">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 border border-[#4CAF50] hover:border-[#2E7D32]"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔄 [ProductGrid] Chargement des produits...');
        setIsLoading(true);
        
        const response = await fetch(`http://localhost:3001/api/web/products?limit=${productsPerPage}&page=${currentPage}`, {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 [ProductGrid] Produits reçus:', data.data?.length || 0);
          
          // Prendre les produits pour la page d'accueil avec pagination
          const homeProducts = data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          }));
          
          setProducts(homeProducts);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
        } else {
          console.error('❌ [ProductGrid] Erreur API:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('💥 [ProductGrid] Erreur:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
            Nos produits
          </h2>
          <p className="text-xl text-[#81C784] font-light font-['Inter'] mb-6">
            Découvrez notre sélection exclusive
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 bg-[#4CAF50] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            Voir tous les produits
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <p className="text-lg text-[#81C784] font-medium">
                {products.length} produits disponibles (page {currentPage} sur {totalPages})
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-[#4CAF50] text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </>
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
    </div>
  );
}
