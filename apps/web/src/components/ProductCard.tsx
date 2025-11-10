import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  rating?: number;
  reviews?: number;
  badge: string | null;
  brand?: string;
  supplier?: {
    name: string;
  };
  isFreeShipping?: boolean;
  stock?: number;
  listedNum?: number;
  deliveryCycle?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Utilisation des couleurs d'étiquettes cohérentes
  const badgeConfig = getBadgeConfig(product.badge as any) || {
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    icon: '🏷️',
    text: 'BADGE'
  };
  
  // Calcul du pourcentage de réduction pour les promos
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;
    
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    if (isWishlistLoading) {
      console.log('⏳ Clic ignoré - action en cours...');
      return;
    }

    console.log('🔥 CŒUR CLIQUÉ !', { productId: product.id, productName: product.name });
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlistLoading(true);
    
    try {
      if (isInWishlist(product.id)) {
        console.log('📤 Suppression des favoris...', product.id);
        await removeFromWishlist(product.id);
        console.log('✅ Supprimé des favoris');
      } else {
        console.log('📥 Ajout aux favoris...', product.id);
        await addToWishlist(product.id);
        console.log('✅ Ajouté aux favoris');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la gestion des favoris:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer relative">
      {/* Favorite button - EN DEHORS du Link */}
      <button 
        onClick={handleToggleWishlist}
        disabled={isWishlistLoading}
        className={`absolute top-4 right-4 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-10 ${
          isInWishlist(product.id)
            ? 'bg-[#FF7043] text-white hover:bg-[#E64A19]'
            : 'bg-white/90 text-[#81C784] hover:bg-white hover:text-[#4CAF50]'
        } ${isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg className="h-5 w-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link href={`/product/${product.id}`}>
        {/* Image du produit */}
        <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative overflow-hidden">
          {(() => {
            const imageUrl = getCleanImageUrl(product.image);
            return imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                  // Fallback si l'image ne charge pas
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null;
          })()}
          <div className={`${getCleanImageUrl(product.image) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
            <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* Badge */}
          {product.badge && (
            <div 
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold z-20"
              style={{ 
                backgroundColor: badgeConfig.backgroundColor, 
                color: badgeConfig.color 
              }}
            >
              {product.badge === 'promo' && discountPercentage > 0 
                ? formatDiscountPercentage(discountPercentage)
                : `${badgeConfig.icon} ${badgeConfig.text}`
              }
            </div>
          )}

          {/* ✅ NOUVEAU : Bouton Quick View */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <Link href={`/product/${product.id}`} onClick={(e) => e.stopPropagation()}>
              <button className="px-4 py-2.5 bg-white text-[#424242] rounded-full shadow-xl font-semibold text-sm hover:bg-[#F8F9FA] transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Aperçu rapide
              </button>
            </Link>
          </div>

          {/* Overlay hover (facultatif) */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300 pointer-events-none" />
        </div>
      
      {/* Product info */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs text-[#9CA3AF] font-normal">{product.brand || product.supplier?.name || 'CJ Dropshipping'}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-2 group-hover:text-[#4CAF50] transition-colors">{product.name}</h3>
        
        {/* ✅ NOUVEAUX INDICATEURS */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Livraison gratuite */}
          {product.isFreeShipping && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
              Livraison gratuite
            </span>
          )}
          
          {/* Stock faible */}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#FFF3E0] text-[#F57C00]">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Plus que {product.stock}
            </span>
          )}
          
          {/* Populaire (si + de 100 listings) */}
          {product.listedNum && product.listedNum > 100 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#E3F2FD] text-[#1976D2]">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              🔥 Populaire
            </span>
          )}
          
          {/* Livraison rapide */}
          {product.deliveryCycle && parseInt(product.deliveryCycle.split('-')[0]) <= 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#F3E5F5] text-[#7B1FA2]">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              {product.deliveryCycle}j
            </span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          {product.reviews && product.reviews > 0 ? (
            <>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[#81C784] font-medium">
                ({product.reviews} avis)
              </span>
            </>
          ) : (
            <span className="text-xs text-[#9CA3AF] italic">
              Nouveau produit
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}€</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-base text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}€</p>
            )}
          </div>
          
          {/* Badge de réduction */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF5722] to-[#F44336]">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
              <span className="text-xs text-[#9CA3AF]">
                Économisez {(product.originalPrice - product.price).toFixed(2)}€
              </span>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] hover:from-[#2E7D32] hover:to-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Ajout en cours...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Ajouter au panier</span>
            </>
          )}
        </button>
      </div>
      </Link>
    </div>
  );
}
