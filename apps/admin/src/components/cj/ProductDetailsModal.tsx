'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CJProduct } from '@/types/cj.types';
import { DollarSign, Star, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CJProduct | any | null; // Accepter CJProduct ou tout type de produit
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
  // TOUS LES HOOKS DOIVENT ÊTRE AU DÉBUT
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Parser les variants avec useMemo pour éviter les re-calculs
  const parsedVariants = useMemo(() => {
    if (!product?.variants) return [];
    
    // Si c'est déjà un tableau, le retourner
    if (Array.isArray(product.variants)) return product.variants;
    
    // Si c'est une chaîne JSON, la parser
    if (typeof product.variants === 'string') {
      try {
        const parsed = JSON.parse(product.variants);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Erreur de parsing des variants:', error);
        return [];
      }
    }
    
    return [];
  }, [product?.variants]);

  // Parser les tags de la même manière
  const parsedTags = useMemo(() => {
    if (!product?.tags) return [];
    
    // Si c'est déjà un tableau, le retourner
    if (Array.isArray(product.tags)) return product.tags;
    
    // Si c'est une chaîne JSON, la parser
    if (typeof product.tags === 'string') {
      try {
        const parsed = JSON.parse(product.tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Erreur de parsing des tags:', error);
        return [];
      }
    }
    
    return [];
  }, [product?.tags]);
  
  const handleClose = () => {
    setSelectedSize('');
    onClose();
  };
  
  if (!product) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+produit';
  };

  // Fonction pour obtenir le vrai prix (pour produits de validation)
  const getDisplayPrice = (product: any) => {
    // Pour les produits de validation, utiliser originalPrice ou price
    if (product.originalPrice && product.originalPrice > 0) {
      return product.originalPrice
    }
    
    if (product.price && product.price > 0) {
      return product.price
    }
    
    // Fallback sur sellPrice pour les produits CJ normaux
    if (product.sellPrice && product.sellPrice > 0) {
      return product.sellPrice
    }
    
    return 0
  }

  // Fonction pour obtenir l'image principale
  const getMainImage = (product: any) => {
    // Essayer productImage en premier (pour produits CJ)
    if (product.productImage) {
      try {
        // Si c'est déjà une URL directe
        if (typeof product.productImage === 'string' && product.productImage.startsWith('http')) {
          return product.productImage;
        }
        
        // Si c'est un tableau JSON
        if (typeof product.productImage === 'string' && product.productImage.startsWith('[')) {
          const images = JSON.parse(product.productImage);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        }
        
        // Si c'est déjà un tableau
        if (Array.isArray(product.productImage) && product.productImage.length > 0) {
          return product.productImage[0];
        }
        
        // Sinon utiliser tel quel
        return product.productImage;
      } catch (e) {
        console.error('Erreur parsing productImage:', e);
        return product.productImage;
      }
    }
    
    // Essayer le champ image standard
    if (product.image) {
      return product.image;
    }
    
    // Essayer images (tableau)
    if (product.images) {
      try {
        const images = JSON.parse(product.images);
        if (Array.isArray(images) && images.length > 0) {
          return images[0];
        }
      } catch (e) {
        // Si ce n'est pas du JSON, utiliser directement
        return product.images;
      }
    }
    
    return 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+produit';
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const formatSuggestedPrice = (price: string | number) => {
    if (!price) return '0.00';
    
    const priceStr = String(price);
    
    // Si c'est une plage (ex: "76.13 - 85.41")
    if (priceStr.includes(' - ')) {
      return priceStr; // Retourner la plage telle quelle
    }
    
    // Si c'est un nombre simple
    const numPrice = parseFloat(priceStr);
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
    
    // Debug: log des variants pour comprendre leur structure
    console.log('🔍 Debug variants pour couleurs:', variants.map(v => ({
      variantName: v.variantName,
      variantNameEn: v.variantNameEn,
      variantKey: v.variantKey,
      variantValue: v.variantValue
    })));
    
    const colors = Array.from(new Set(variants.map(v => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      
      let color = null;
      
      // Format CJ: Couleur est généralement l'avant-dernier mot
      // Ex: "neck Patchwork Lace Irregular Solid Color Jumpsuit White S"
      // Couleur = "White", Taille = "S"
      const words = name.trim().split(' ');
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'XXL', 'XXXL'];
      
      if (words.length >= 2 && validSizes.includes(words[words.length - 1].toUpperCase())) {
        // Si le dernier mot est une taille, l'avant-dernier est probablement la couleur
        color = words[words.length - 2];
      }
      // Format 1: "Couleur-Taille" (ex: "Red-M")
      else if (name.includes('-')) {
        color = name.split('-')[0]?.trim();
      }
      // Format 2: Couleur directe
      else if (name.trim()) {
        color = name.trim();
      }
      // Format 3: Dans variantValue ou variantKey
      else {
        const variantValue = v.variantValue || '';
        const variantKey = v.variantKey || '';
        
        if (variantValue.trim()) {
          color = variantValue.trim();
        } else if (variantKey.trim()) {
          color = variantKey.trim();
        }
      }
      
      return color;
    }).filter(Boolean)));
    
    console.log('🎨 Couleurs extraites:', colors);
    return colors.length > 0 ? colors.join(', ') : 'N/A';
  };

  // 📏 Fonction pour extraire les tailles des variantes
  const extractSizesFromVariants = (variants: any[]): string => {
    if (!variants || variants.length === 0) return 'N/A';
    
    // Debug: log des variants pour comprendre leur structure
    console.log('🔍 Debug variants pour tailles:', variants.map(v => ({
      variantName: v.variantName,
      variantNameEn: v.variantNameEn,
      variantKey: v.variantKey,
      variantValue: v.variantValue
    })));
    
    const sizes = Array.from(new Set(variants.map(v => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      
      // Essayer plusieurs formats de tailles
      let size = null;
      
      // Format CJ: Taille à la fin du nom complet
      // Ex: "neck Patchwork Lace Irregular Solid Color Jumpsuit White S"
      const words = name.trim().split(' ');
      const lastWord = words[words.length - 1];
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'XXL', 'XXXL'];
      
      if (validSizes.includes(lastWord.toUpperCase())) {
        size = lastWord.toUpperCase();
      }
      // Format 1: "Couleur-Taille" (ex: "Red-M")
      else if (name.includes('-') && name.split('-').length >= 2) {
        const splitSize = name.split('-')[1]?.trim();
        if (validSizes.includes(splitSize?.toUpperCase())) {
          size = splitSize.toUpperCase();
        }
      }
      // Format 2: Taille directe (ex: "M", "L", "XL")
      else if (/^[A-Z]{1,3}$/.test(name.trim()) && validSizes.includes(name.trim().toUpperCase())) {
        size = name.trim().toUpperCase();
      }
      // Format 3: Dans variantValue ou variantKey
      else {
        const variantValue = v.variantValue || '';
        const variantKey = v.variantKey || '';
        
        // Chercher des tailles standard dans variantValue
        if (/^[A-Z]{1,3}$/.test(variantValue.trim()) && validSizes.includes(variantValue.trim().toUpperCase())) {
          size = variantValue.trim().toUpperCase();
        }
        // Ou dans variantKey
        else if (/^[A-Z]{1,3}$/.test(variantKey.trim()) && validSizes.includes(variantKey.trim().toUpperCase())) {
          size = variantKey.trim().toUpperCase();
        }
        // Ou extraction de patterns de taille dans le texte
        else {
          const sizeMatch = (name + ' ' + variantValue + ' ' + variantKey).match(/\b(XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL)\b/i);
          if (sizeMatch) {
            size = sizeMatch[1].toUpperCase();
          }
        }
      }
      
      return size;
    }).filter(Boolean)));
    
    console.log('🎯 Tailles extraites:', sizes);
    return sizes.length > 0 ? sizes.join(', ') : 'N/A';
  };


  
  // Extraire toutes les images du produit (chaque image = une couleur)
  const getAllImages = () => {
    let images: string[] = [];
    
    // Parser les images du produit
    if (product.productImage) {
      try {
        // Si c'est une chaîne qui ressemble à un tableau JSON
        if (typeof product.productImage === 'string' && product.productImage.startsWith('[')) {
          const parsed = JSON.parse(product.productImage);
          if (Array.isArray(parsed)) {
            images = parsed.filter(img => img && typeof img === 'string');
          } else {
            images = [product.productImage];
          }
        } else if (typeof product.productImage === 'string') {
          images = [product.productImage];
        } else if (Array.isArray(product.productImage)) {
          images = product.productImage.filter((img: any) => img && typeof img === 'string');
        }
      } catch (e) {
        console.error('Erreur parsing productImage:', e);
        if (typeof product.productImage === 'string') {
          images = [product.productImage];
        }
      }
    }
    
    // Si pas d'images du produit principal, essayer image standard
    if (images.length === 0 && product.image) {
      images = [product.image];
    }
    
    // Ajouter les images des variantes
    if (parsedVariants && parsedVariants.length > 0) {
      parsedVariants.forEach((variant: any) => {
        if (variant.images && Array.isArray(variant.images)) {
          images.push(...variant.images.filter((img: any) => img && typeof img === 'string'));
        } else if (variant.variantImage && typeof variant.variantImage === 'string') {
          images.push(variant.variantImage);
        }
      });
    }
    
    // Supprimer les doublons et filtrer les URLs valides
    const uniqueImages = Array.from(new Set(images)).filter(img => 
      img && 
      typeof img === 'string' && 
      (img.startsWith('http') || img.startsWith('/'))
    );
    
    // Si aucune image valide, retourner un placeholder
    return uniqueImages.length > 0 ? uniqueImages : ['https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+produit'];
  };

  // Extraire les couleurs des variantes (pour l'affichage)
  const getColorsFromVariants = (): string[] => {
    if (!parsedVariants || parsedVariants.length === 0) return [];
    
    const colors = Array.from(new Set(parsedVariants.map((v: any) => {
      const name = (v as any).variantNameEn || (v as any).variantName || '';
      const color = name.split('-')[0]?.trim();
      return color;
    }).filter(Boolean))) as string[];
    
    return colors;
  };

  const allImages = getAllImages();
  const colors = getColorsFromVariants();
  const currentImage = allImages[selectedImageIndex] || getMainImage(product);
  const currentColor = colors[selectedImageIndex] || 'Couleur principale';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Product Details" size="xl">
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
                  ${formatPrice(getDisplayPrice(product))}
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
            {parsedVariants && parsedVariants.length > 0 && (
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
                {extractSizesFromVariants(parsedVariants) !== 'N/A' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tailles disponibles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {extractSizesFromVariants(parsedVariants).split(', ').map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(selectedSize === size.trim() ? '' : size.trim())}
                          className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                            selectedSize === size.trim()
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {size.trim()}
                        </button>
                      ))}
                    </div>
                    {selectedSize && (
                      <p className="text-sm text-gray-600 mt-2">
                        Taille sélectionnée: <span className="font-medium text-orange-600">{selectedSize}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
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
        {parsedVariants && parsedVariants.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🎨 Available Variants ({parsedVariants.length})
            </h4>
            
            {/* Résumé des variants */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 border">
                <label className="text-sm font-medium text-gray-700">Total Variants</label>
                <p className="text-lg font-bold text-blue-600 mt-1">{parsedVariants.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <label className="text-sm font-medium text-gray-700">Colors Available</label>
                <p className="text-sm text-gray-900 mt-1 font-medium">{extractColorsFromVariants(parsedVariants)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <label className="text-sm font-medium text-gray-700">Sizes Available</label>
                <p className="text-sm text-gray-900 mt-1 font-medium">{extractSizesFromVariants(parsedVariants)}</p>
              </div>
            </div>
            
            {/* Tableau des variants (style CJ) */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-700">Variant</th>
                      <th className="text-left p-3 font-medium text-gray-700">VID</th>
                      <th className="text-left p-3 font-medium text-gray-700">SKU</th>
                      <th className="text-left p-3 font-medium text-gray-700">Price</th>
                      <th className="text-left p-3 font-medium text-gray-700">Weight</th>
                      <th className="text-left p-3 font-medium text-gray-700">Dimensions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedVariants.map((variant: any, index: number) => (
                      <tr key={variant.vid || index} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {variant.variantImage && (
                              <img 
                                src={variant.variantImage} 
                                alt={variant.variantNameEn || variant.variantName}
                                className="w-8 h-8 rounded object-cover"
                                onError={handleImageError}
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {variant.variantNameEn || variant.variantName || `Variant ${index + 1}`}
                              </p>
                              {variant.variantKey && (
                                <p className="text-xs text-gray-500">{variant.variantKey}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-mono text-gray-600">
                            {variant.vid ? String(variant.vid).slice(-8) : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-mono text-blue-600">
                            {variant.variantSku || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          {variant.variantSellPrice ? (
                            <span className="font-semibold text-green-600">
                              ${formatPrice(variant.variantSellPrice)}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-gray-700">
                            {variant.variantWeight ? `${Math.round(variant.variantWeight)}g` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          {variant.variantLength && variant.variantWidth && variant.variantHeight ? (
                            <span className="text-xs text-gray-600">
                              {variant.variantLength}×{variant.variantWidth}×{variant.variantHeight}
                            </span>
                          ) : variant.variantStandard ? (
                            <span className="text-xs text-gray-600">{variant.variantStandard}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Informations supplémentaires des variants */}
            <div className="mt-4 text-xs text-gray-600">
              <p>💡 Tous les variants sont affichés ci-dessus. Chaque variant a ses propres spécifications (prix, poids, dimensions).</p>
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
              <p className="text-sm text-gray-900 mt-1">${formatPrice(getDisplayPrice(product))}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Suggested Price</label>
              <p className="text-sm text-gray-900 mt-1">${formatSuggestedPrice(product.suggestSellPrice || 0)}</p>
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

            {product.materialNameEn && (
              <div>
                <label className="text-sm font-medium text-gray-700">Material</label>
                <p className="text-sm text-gray-900 mt-1">{product.materialNameEn}</p>
              </div>
            )}

            {product.packingNameEn && (
              <div>
                <label className="text-sm font-medium text-gray-700">Packaging</label>
                <p className="text-sm text-gray-900 mt-1">{product.packingNameEn}</p>
              </div>
            )}

            {product.productKeyEn && (
              <div>
                <label className="text-sm font-medium text-gray-700">Attributes</label>
                <p className="text-sm text-gray-900 mt-1">{product.productKeyEn}</p>
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
        {parsedTags && parsedTags.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {parsedTags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
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
