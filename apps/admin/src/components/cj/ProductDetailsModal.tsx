'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CJProduct } from '@/types/cj.types';
import { DollarSign, Star, Tag } from 'lucide-react';
import { useState } from 'react';

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

  // 🎨 Fonction pour extraire les couleurs des variantes
  const extractColorsFromVariants = (variants: any[]): string => {
    if (!variants || variants.length === 0) return 'N/A';
    
    const colors = Array.from(new Set(variants.map(v => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      // Extraire la couleur (première partie avant le tiret)
      const color = name.split('-')[0]?.trim();
      return color;
    }).filter(Boolean)));
    
    return colors.join(', ');
  };

  // 📏 Fonction pour extraire les tailles des variantes
  const extractSizesFromVariants = (variants: any[]): string => {
    if (!variants || variants.length === 0) return 'N/A';
    
    const sizes = Array.from(new Set(variants.map(v => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      // Extraire la taille (deuxième partie après le tiret)
      const size = name.split('-')[1]?.trim();
      return size;
    }).filter(Boolean)));
    
    return sizes.join(', ');
  };

  // État pour la galerie d'images/couleurs
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Extraire toutes les images du produit (chaque image = une couleur)
  const getAllImages = () => {
    let images = [];
    
    // Image principale
    if (product.productImage) {
      let mainImage = product.productImage;
      
      if (Array.isArray(mainImage)) {
        images = mainImage;
      } else if (typeof mainImage === 'string' && mainImage.includes('[')) {
        try {
          const parsed = JSON.parse(mainImage);
          if (Array.isArray(parsed)) {
            images = parsed;
          } else {
            images = [mainImage];
          }
        } catch (e) {
          images = [mainImage];
        }
      } else {
        images = [mainImage];
      }
    }
    
    // Ajouter les images des variantes
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.images && Array.isArray(variant.images)) {
          images.push(...variant.images);
        }
      });
    }
    
    // Supprimer les doublons
    return Array.from(new Set(images));
  };

  // Extraire les couleurs des variantes (pour l'affichage)
  const getColorsFromVariants = () => {
    if (!product.variants || product.variants.length === 0) return [];
    
    const colors = Array.from(new Set(product.variants.map(v => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      const color = name.split('-')[0]?.trim();
      return color;
    }).filter(Boolean)));
    
    return colors;
  };

  const allImages = getAllImages();
  const colors = getColorsFromVariants();
  const currentImage = allImages[selectedImageIndex] || '/placeholder-product.jpg';
  const currentColor = colors[selectedImageIndex] || 'Couleur principale';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="xl">
      <div className="space-y-6">
        {/* Header avec galerie d'images et infos principales */}
        <div className="flex gap-6">
          {/* Galerie d'images comme CJ Dropshipping */}
          <div className="flex-shrink-0">
            <div className="flex gap-4">
              {/* Thumbnails à gauche (Images = Couleurs) */}
              {allImages.length > 1 && (
                <div className="flex flex-col gap-2 w-16">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index 
                          ? 'border-orange-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={colors[index] || `Couleur ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={colors[index] || `Couleur ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image principale */}
              <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
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

            {/* Sélecteurs comme CJ Dropshipping */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {/* Affichage de la couleur sélectionnée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur ({currentColor})
                  </label>
                  <div className="text-sm text-gray-600">
                    Cliquez sur les images à gauche pour changer de couleur
                  </div>
                </div>

                {/* Sélecteur de tailles */}
                {extractSizesFromVariants(product.variants) !== 'N/A' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tailles disponibles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {extractSizesFromVariants(product.variants).split(', ').map((size, index) => (
                        <button
                          key={index}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50"
                        >
                          {size.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

        {/* === VARIANTES DISPONIBLES (comme CJ) === */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🎨 Available Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Total Variants</label>
                <p className="text-sm text-gray-900 mt-1">{product.variants.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Colors</label>
                <p className="text-sm text-gray-900 mt-1">{extractColorsFromVariants(product.variants)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sizes</label>
                <p className="text-sm text-gray-900 mt-1">{extractSizesFromVariants(product.variants)}</p>
              </div>
            </div>
            
            {/* Afficher seulement les 5 premières variantes pour éviter l'écriture en boucle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.variants.slice(0, 5).map((variant: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{variant.variantNameEn || variant.variantName || `Variant ${index + 1}`}</span>
                    {variant.variantSellPrice && (
                      <span className="text-sm font-semibold text-green-600">
                        ${formatPrice(variant.variantSellPrice)}
                      </span>
                    )}
                  </div>
                  {variant.variantSku && (
                    <p className="text-xs text-gray-500">SKU: {variant.variantSku}</p>
                  )}
                  {variant.variantWeight && (
                    <p className="text-xs text-gray-500">Weight: {formatWeight(variant.variantWeight)}</p>
                  )}
                </div>
              ))}
              {product.variants.length > 5 && (
                <div className="col-span-full text-center text-sm text-gray-500 py-2">
                  ... et {product.variants.length - 5} autres variantes
                </div>
              )}
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

        {/* === PRIX ET MARGES === */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Base Price</label>
              <p className="text-sm text-gray-900 mt-1">${formatPrice(product.sellPrice)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Suggested Price</label>
              <p className="text-sm text-gray-900 mt-1">${formatPrice(product.suggestSellPrice || 0)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Lists</label>
              <p className="text-sm text-gray-900 mt-1">{product.listedNum || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">SKU</label>
              <p className="text-sm text-gray-900 mt-1">{product.productSku || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Supplier</label>
              <p className="text-sm text-gray-900 mt-1">{product.supplierName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* === INFORMATIONS TECHNIQUES === */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🔧 Technical Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.productWeight && (
              <div>
                <label className="text-sm font-medium text-gray-700">Weight</label>
                <p className="text-sm text-gray-900 mt-1">{formatWeight(product.productWeight)}</p>
              </div>
            )}
            
            {product.packingWeight && (
              <div>
                <label className="text-sm font-medium text-gray-700">Packing Weight</label>
                <p className="text-sm text-gray-900 mt-1">{formatWeight(product.packingWeight)}</p>
              </div>
            )}
            
            {product.productUnit && (
              <div>
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <p className="text-sm text-gray-900 mt-1">{product.productUnit}</p>
              </div>
            )}

            {product.entryCode && (
              <div>
                <label className="text-sm font-medium text-gray-700">HS Code</label>
                <p className="text-sm text-gray-900 mt-1">{product.entryCode}</p>
              </div>
            )}

            {product.productType && (
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900 mt-1">{product.productType}</p>
              </div>
            )}

            {product.createrTime && (
              <div>
                <label className="text-sm font-medium text-gray-700">Creation Date</label>
                <p className="text-sm text-gray-900 mt-1">{product.createrTime}</p>
              </div>
            )}
          </div>
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
