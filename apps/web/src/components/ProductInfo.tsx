'use client';

import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  badge?: string;
  brand?: string;
  supplier?: {
    name: string;
  };
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  stock: number;
  status: string;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  // Utilisation des couleurs d'étiquettes cohérentes
  const badgeConfig = getBadgeConfig(product.badge as any);
  
  // Calcul du pourcentage de réduction pour les promos
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  return (
    <div className="space-y-6">
      {/* Badge */}
      {product.badge && (
        <div 
          className="inline-block px-3 py-1 rounded-full text-sm font-bold"
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

      {/* Informations de base */}
      <div>
        <p className="text-sm text-[#81C784] font-medium mb-2">{product.brand || product.supplier?.name || 'KAMRI'}</p>
        <h1 className="text-3xl font-bold text-[#424242] mb-4">{product.name}</h1>
        
        {/* Rating */}
        {product.rating && product.reviews && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-[#81C784]">({product.reviews} avis)</span>
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-[#4CAF50]">{product.price.toFixed(2)}€</span>
          {product.originalPrice && (
            <span className="text-xl text-[#9CA3AF] line-through">{product.originalPrice.toFixed(2)}€</span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-[#424242] leading-relaxed mb-6">{product.description}</p>
        )}
      </div>

      {/* Couleurs */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#424242] mb-3">Couleur</h3>
          <div className="flex gap-3">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                    : 'border-gray-300 bg-white text-[#424242] hover:border-[#81C784]'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tailles (mode) */}
      {product.type === 'mode' && product.sizes && (
        <div>
          <h3 className="text-lg font-semibold text-[#424242] mb-3">Taille</h3>
          <div className="flex gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedSize === size
                    ? 'border-[#4CAF50] bg-[#4CAF50] text-white'
                    : 'border-gray-300 bg-white text-[#424242] hover:border-[#81C784]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spécifications (tech) */}
      {product.type === 'tech' && product.specifications && (
        <div>
          <h3 className="text-lg font-semibold text-[#424242] mb-3">Spécifications techniques</h3>
          <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-[#81C784] font-medium">{key}:</span>
                <span className="text-[#424242] font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantité */}
      <div>
        <h3 className="text-lg font-semibold text-[#424242] mb-3">Quantité</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xl font-semibold text-[#424242] min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-full bg-[#E8F5E8] flex items-center justify-center hover:bg-[#4CAF50] hover:text-white transition-all duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <button className="flex-1 bg-[#4CAF50] text-white py-4 px-6 rounded-lg font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Ajouter au panier
        </button>
        <button className="flex-1 bg-white text-[#4CAF50] py-4 px-6 rounded-lg font-bold border-2 border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transform hover:scale-105 transition-all duration-200">
          Acheter maintenant
        </button>
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2 text-[#4CAF50]">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">
          {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
        </span>
      </div>
    </div>
  );
}
