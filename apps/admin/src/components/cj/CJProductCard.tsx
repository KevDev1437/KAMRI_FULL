'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CJProduct } from '@/types/cj'
import {
    Download,
    ExternalLink,
    Eye,
    Loader2,
    Package,
    Star
} from 'lucide-react'

interface CJProductCardProps {
  product: CJProduct
  onImport: () => void
  onPreview: () => void
  importInProgress: boolean
}

export const CJProductCard = ({
  product,
  onImport,
  onPreview,
  importInProgress
}: CJProductCardProps) => {
  // Fonction pour obtenir les badges
  const getProductBadges = (product: CJProduct): string[] => {
    const badges: string[] = []
    
    if (product.freeShipping) badges.push('FREE_SHIPPING')
    if ((product.listedNum || 0) > 1000) badges.push('POPULAR')
    if (parseInt(product.deliveryTime || '72') <= 24) badges.push('FAST_DELIVERY')
    if ((product.stock?.US || 0) > 500) badges.push('HIGH_STOCK')
    if (product.sellPrice < 10) badges.push('LOW_PRICE')
    
    return badges
  }

  // Fonction pour obtenir la couleur du stock
  const getStockColor = (stock: number): string => {
    if (stock === 0) return 'text-red-500'
    if (stock < 10) return 'text-orange-500'
    return 'text-green-500'
  }

  // Fonction pour obtenir l'icône de livraison
  const getDeliveryIcon = (deliveryTime: string): string => {
    const time = parseInt(deliveryTime)
    if (time <= 24) return '⚡'
    if (time <= 48) return '🚚'
    return '📦'
  }

  // Fonction pour nettoyer l'URL de l'image
  const getCleanImageUrl = (image: string | string[] | undefined): string | null => {
    if (!image) return null

    if (typeof image === 'string') {
      try {
        const parsed = JSON.parse(image)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0]
        }
        return image
      } catch {
        return image
      }
    } else if (Array.isArray(image) && image.length > 0) {
      return image[0]
    }

    return null
  }

  // Données sécurisées avec valeurs par défaut
  const safeProduct = {
    stock: product.stock || { US: 0, FR: 0, CN: 0 },
    deliveryTime: product.deliveryTime || '72',
    freeShipping: product.freeShipping || false,
    listedNum: product.listedNum || 0,
    variants: product.variants || []
  }

  const imageUrl = getCleanImageUrl(product.productImage)
  const hasDiscount = product.originalPrice && product.originalPrice > product.sellPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.sellPrice) / product.originalPrice) * 100)
    : 0

  // Calculer les badges et couleurs
  const badges = getProductBadges(product)
  const stockColor = getStockColor(safeProduct.stock.US)
  const deliveryIcon = getDeliveryIcon(safeProduct.deliveryTime)

  return (
    <Card className="kamri-card group hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardContent className="p-0">
        {/* Image du produit */}
        <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.productNameEn || product.productName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <Package className={`h-12 w-12 text-gray-400 ${imageUrl ? 'hidden' : ''}`} />

          {/* Badge CJ Dropshipping */}
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            CJ
          </div>

          {/* Indicateur de réduction */}
          {hasDiscount && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}

          {/* Bouton de prévisualisation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Informations du produit */}
        <div className="p-4">
          {/* Nom du produit */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
              {product.productNameEn || product.productName}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {product.categoryName}
            </p>
          </div>

          {/* Prix */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary-600">
                ${product.sellPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {(product.listedNum || 0) > 1000 && (
              <div className="flex items-center text-xs text-orange-600">
                <Star className="h-3 w-3 mr-1" />
                {product.listedNum}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onImport}
              disabled={importInProgress}
            >
              {importInProgress ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Download className="w-3 h-3 mr-1" />
              )}
              {importInProgress ? 'Import...' : 'Importer'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="px-3"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}