'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeFooter from '../../../components/HomeFooter';
import ModernHeader from '../../../components/ModernHeader';
import SimilarProducts from '../../../components/SimilarProducts';
import { useCart } from '../../../contexts/CartContext';
import { useFavorites } from '../../../contexts/FavoritesContext';

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
  description?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔄 [ProductDetail] Chargement du produit:', productId);
        setIsLoading(true);
        
        // Appel API pour récupérer le produit spécifique
        const response = await fetch(`http://localhost:3001/api/web/products/${productId}`, {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 [ProductDetail] Produit reçu:', data);
          
          // Adapter les données
          const adaptedProduct = {
            id: data.data.id,
            name: data.data.name,
            price: data.data.price,
            originalPrice: data.data.originalPrice,
            image: data.data.image,
            category: data.data.category?.name || 'Général',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100),
            badge: data.data.originalPrice ? 'Promo' : null,
            brand: 'Fake Store',
            description: data.data.description || 'Description du produit non disponible.',
          };
          
          setProduct(adaptedProduct);
        } else {
          console.error('❌ [ProductDetail] Erreur API:', response.status);
        }
      } catch (error) {
        console.error('💥 [ProductDetail] Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      console.log('🛒 [ProductDetail] Ajouter au panier:', product.name, 'Quantité:', quantity);
      // Ajouter le produit avec la quantité sélectionnée
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      if (isFavorite(product.id)) {
        console.log('💔 [ProductDetail] Retirer des favoris:', product.name);
        removeFromFavorites(product.id);
      } else {
        console.log('❤️ [ProductDetail] Ajouter aux favoris:', product.name);
        addToFavorites({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-[#424242] mb-2">Produit non trouvé</h2>
            <p className="text-[#81C784] mb-6">Le produit que vous recherchez n'existe pas.</p>
            <a href="/products" className="bg-[#4CAF50] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2E7D32] transition-colors">
              Retour aux produits
            </a>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><a href="/" className="hover:text-[#4CAF50]">Accueil</a></li>
            <li>/</li>
            <li><a href="/products" className="hover:text-[#4CAF50]">Produits</a></li>
            <li>/</li>
            <li className="text-[#424242] font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm text-[#81C784] font-medium">{product.brand}</span>
              <h1 className="text-3xl font-bold text-[#424242] mt-2">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[#81C784]">({product.reviews} avis)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}€</span>
              {product.originalPrice && (
                <span className="text-xl text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}€</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-[#424242] mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-[#424242] mb-2">Quantité</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#4CAF50] text-white py-4 px-8 rounded-full font-bold text-lg hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Ajouter au panier
              </button>
              
              <button 
                onClick={handleToggleFavorite}
                className={`w-full border-2 py-4 px-8 rounded-full font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  isFavorite(product?.id || '') 
                    ? 'bg-[#4CAF50] text-white border-[#4CAF50]' 
                    : 'bg-white text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white'
                }`}
              >
                <svg className="h-6 w-6" fill={isFavorite(product?.id || '') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite(product?.id || '') ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mb-16">
          <SimilarProducts products={[]} />
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}