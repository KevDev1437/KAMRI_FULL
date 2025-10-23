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
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
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
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
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
                className="w-full h-full object-cover"
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
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
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
        </div>
      
      {/* Product info */}
      <div className="p-6">
              <div className="mb-2">
                <span className="text-sm text-[#81C784] font-medium">{product.brand || product.supplier?.name || 'N/A'}</span>
              </div>
        
        <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-2">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-[#81C784]">({product.reviews || 0})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-6">
          <p className="text-2xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}€</p>
          {product.originalPrice && (
            <p className="text-lg text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}€</p>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter au panier
        </button>
      </div>
      </Link>
    </div>
  );
}
