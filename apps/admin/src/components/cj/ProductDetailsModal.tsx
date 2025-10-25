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

  const formatWeight = (weight: string | number) => {
    if (!weight) return '';
    const weightStr = String(weight);
    
    // Si c'est une plage (ex: "500.00-620.00g")
    if (weightStr.includes('-')) {
      const [min, max] = weightStr.split('-').map(w => parseFloat(w.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        const avg = Math.round((min + max) / 2);
        return `${avg}g`;
      }
    }
    
    // Si c'est un poids simple
    const numWeight = parseFloat(weightStr);
    return isNaN(numWeight) ? '' : `${Math.round(numWeight)}g`;
  };

  const cleanProductName = (name: string) => {
    if (!name) return '';
    
    // Si le nom contient des caractères chinois, utiliser la version anglaise
    if (/[\u4e00-\u9fff]/.test(name)) {
      // Chercher la version anglaise dans le nom
      const englishMatch = name.match(/[A-Za-z\s]+/);
      if (englishMatch) {
        return englishMatch[0].trim();
      }
    }
    
    return name;
  };

  // Fonction pour nettoyer le HTML de la description
  const cleanDescription = (html: string) => {
    if (!html) return '';
    // Supprimer les balises HTML et nettoyer le texte
    return html
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="xl">
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
                {cleanProductName(product.productName)}
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
                {product.suggestSellPrice && (
                  <span className="text-sm text-gray-500">
                    (Suggéré: ${product.suggestSellPrice})
                  </span>
                )}
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
                {importing ? 'Importing...' : 'Import this product'}
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {cleanDescription(product.description)}
            </div>
          </div>
        )}

        {/* Variantes */}
        {product.variants && product.variants.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.variants.map((variant: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{variant.variantName || `Variant ${index + 1}`}</span>
                    {variant.variantSellPrice && (
                      <span className="text-sm font-semibold text-green-600">
                        ${formatPrice(variant.variantSellPrice)}
                      </span>
                    )}
                  </div>
                  {variant.variantSku && (
                    <p className="text-xs text-gray-500">SKU: {variant.variantSku}</p>
                  )}
                  {variant.stock !== undefined && (
                    <p className="text-xs text-gray-500">
                      Stock: {variant.stock} units
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
              Customer Reviews ({product.reviews.length})
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
                    <span className="text-sm font-medium">{review.userName || 'Anonymous'}</span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.productWeight && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Weight: {formatWeight(product.productWeight)}
              </span>
            </div>
          )}
          
          {product.packingWeight && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Packing Weight: {formatWeight(product.packingWeight)}
              </span>
            </div>
          )}
          
          {product.productUnit && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Unit: {product.productUnit}
              </span>
            </div>
          )}

          {product.entryCode && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                HS Code: {product.entryCode}
              </span>
            </div>
          )}

          {product.listedNum && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Listed Count: {product.listedNum}
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
            Close
          </Button>
          {onImport && (
            <Button 
              onClick={() => onImport(product.pid)}
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
