'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CJProduct } from '@/types/cj.types';
import { DollarSign, Image as ImageIcon, Package, Star, Tag } from 'lucide-react';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CJProduct | null;
  onImport?: (productId: string) => void;
  importing?: boolean;
}

export function ProductDetailsModal({ 
  isOpen, 
  onClose, 
  product, 
  onImport, 
  importing = false 
}: ProductDetailsModalProps) {
  if (!product) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-product.jpg';
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du produit" size="xl">
      <div className="space-y-6">
        {/* Header avec image et infos principales */}
        <div className="flex gap-6">
          {/* Image du produit */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {product.productImage ? (
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Infos principales */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.productName}
              </h3>
              {product.productNameEn && product.productNameEn !== product.productName && (
                <p className="text-sm text-gray-600 mb-2">
                  {product.productNameEn}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-lg font-semibold text-green-600">
                  ${formatPrice(product.sellPrice)}
                </span>
              </div>
              
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.totalReviews} avis)
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {product.productSku}
              </Badge>
              {product.categoryName && (
                <Badge variant="outline">
                  {product.categoryName}
                </Badge>
              )}
            </div>

            {onImport && (
              <Button 
                onClick={() => onImport(product.pid)}
                disabled={importing}
                className="w-full"
              >
                {importing ? 'Import en cours...' : 'Importer ce produit'}
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Variantes */}
        {product.variants && product.variants.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Variantes disponibles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.variants.map((variant: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{variant.name || `Variante ${index + 1}`}</span>
                    {variant.price && (
                      <span className="text-sm font-semibold text-green-600">
                        ${formatPrice(variant.price)}
                      </span>
                    )}
                  </div>
                  {variant.sku && (
                    <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                  )}
                  {variant.stock !== undefined && (
                    <p className="text-xs text-gray-500">
                      Stock: {variant.stock} unités
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avis */}
        {product.reviews && product.reviews.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Avis clients ({product.reviews.length})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {product.reviews.slice(0, 5).map((review: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < (review.rating || 0) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.author || 'Anonyme'}</span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.weight && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Poids: {product.weight}g
              </span>
            </div>
          )}
          
          {product.dimensions && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Dimensions: {product.dimensions}
              </span>
            </div>
          )}
          
          {product.brand && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Marque: {product.brand}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {onImport && (
            <Button 
              onClick={() => onImport(product.pid)}
              disabled={importing}
            >
              {importing ? 'Import en cours...' : 'Importer'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
