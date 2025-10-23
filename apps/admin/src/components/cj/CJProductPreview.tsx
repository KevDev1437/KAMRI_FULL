'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CJBadge, CJProduct } from '@/types/cj'
import {
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Loader2,
    Package,
    Star,
    Truck,
    X
} from 'lucide-react'
import { useState } from 'react'

interface CJProductPreviewProps {
  product: CJProduct
  open: boolean
  onClose: () => void
  onImport: (product: CJProduct) => void
  importInProgress: boolean
}

export const CJProductPreview = ({
  product,
  open,
  onClose,
  onImport,
  importInProgress
}: CJProductPreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!open) return null

  // Fonction pour obtenir les badges
  const getProductBadges = (product: CJProduct): CJBadge[] => {
    const badges: CJBadge[] = []
    
    if (product.freeShipping) badges.push('FREE_SHIPPING')
    if ((product.listedNum || 0) > 1000) badges.push('POPULAR')
    if (parseInt(product.deliveryTime || '72') <= 24) badges.push('FAST_DELIVERY')
    if ((product.stock?.US || 0) > 500) badges.push('HIGH_STOCK')
    if (product.sellPrice < 10) badges.push('LOW_PRICE')
    
    return badges
  }

  // Fonction pour obtenir le texte du badge
  const getBadgeText = (badge: CJBadge): string => {
    switch (badge) {
      case 'FREE_SHIPPING':
        return '🚚 Livraison gratuite'
      case 'POPULAR':
        return '🔥 Populaire'
      case 'FAST_DELIVERY':
        return '⚡ Livraison rapide'
      case 'HIGH_STOCK':
        return '📦 Stock élevé'
      case 'LOW_PRICE':
        return '💰 Bon prix'
      default:
        return ''
    }
  }

  // Fonction pour obtenir la couleur du badge
  const getBadgeColor = (badge: CJBadge): string => {
    switch (badge) {
      case 'FREE_SHIPPING':
        return 'bg-green-100 text-green-800'
      case 'POPULAR':
        return 'bg-orange-100 text-orange-800'
      case 'FAST_DELIVERY':
        return 'bg-blue-100 text-blue-800'
      case 'HIGH_STOCK':
        return 'bg-purple-100 text-purple-800'
      case 'LOW_PRICE':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Fonction pour nettoyer les URLs d'images
  const getCleanImageUrls = (image: string | string[] | undefined): string[] => {
    if (!image) return []

    if (typeof image === 'string') {
      try {
        const parsed = JSON.parse(image)
        if (Array.isArray(parsed)) {
          return parsed.filter(url => url && typeof url === 'string')
        }
        return [image]
      } catch {
        return [image]
      }
    } else if (Array.isArray(image)) {
      return image.filter(url => url && typeof url === 'string')
    }

    return []
  }

  const images = getCleanImageUrls(product.productImage)
  const badges = getProductBadges(product)
  const hasDiscount = product.originalPrice && product.originalPrice > product.sellPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.sellPrice) / product.originalPrice) * 100)
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="kamri-card max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Prévisualisation du produit
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images du produit */}
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={product.productNameEn || product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                
                {/* Navigation des images */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        index === currentImageIndex 
                          ? 'border-primary-500' 
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="space-y-6">
              {/* Nom et catégorie */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.productNameEn || product.productName}
                </h2>
                <p className="text-gray-600 mb-4">
                  {product.categoryName}
                </p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {badges.map((badge, index) => (
                    <Badge
                      key={index}
                      className={`text-sm ${getBadgeColor(badge)}`}
                    >
                      {getBadgeText(badge)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary-600">
                    ${product.sellPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <Badge className="bg-red-100 text-red-800">
                        -{discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
                
                {(product.listedNum || 0) > 1000 && (
                  <div className="flex items-center text-sm text-orange-600">
                    <Star className="h-4 w-4 mr-1" />
                    {product.listedNum} ventes
                  </div>
                )}
              </div>

              {/* Stock par pays */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Stock disponible</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.stock || {}).map(([country, stock]) => (
                    <div key={country} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">
                        {country === 'US' ? '🇺🇸 États-Unis' : 
                         country === 'FR' ? '🇫🇷 France' : 
                         country === 'CN' ? '🇨🇳 Chine' : country}
                      </span>
                      <span className={`text-sm font-bold ${
                        stock === 0 ? 'text-red-500' :
                        stock < 10 ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
                        {stock} unités
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations de livraison */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Livraison</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Délai de livraison</span>
                    <span className="text-sm font-medium">
                      {product.deliveryTime}h
                    </span>
                  </div>
                  
                  {product.freeShipping && (
                    <div className="flex items-center p-3 bg-green-50 rounded">
                      <Truck className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800 font-medium">
                        Livraison gratuite disponible
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Variantes */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Variantes ({product.variants.length})
                  </h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {product.variants.map((variant) => (
                      <div key={variant.variantId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{variant.variantName}</p>
                          <p className="text-xs text-gray-500">SKU: {variant.variantSku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${variant.sellPrice.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Stock: {variant.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => onImport(product)}
                  disabled={importInProgress}
                  className="kamri-button flex-1"
                >
                  {importInProgress ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {importInProgress ? 'Import en cours...' : 'Importer ce produit'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://www.cjdropshipping.com/product/${product.pid}`, '_blank')}
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir sur CJ
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
