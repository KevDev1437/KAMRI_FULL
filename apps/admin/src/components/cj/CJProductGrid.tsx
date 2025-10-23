'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CJProduct } from '@/types/cj'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { CJProductCard } from './CJProductCard'

interface CJProductGridProps {
  products: CJProduct[]
  loading: boolean
  importInProgress: { [pid: string]: boolean }
  onImport: (product: CJProduct) => void
  onPreview: (product: CJProduct) => void
  pagination: {
    currentPage: number
    totalPages: number
    totalResults: number
    pageSize: number
  }
  onPageChange: (page: number) => void
}

export const CJProductGrid = ({
  products,
  loading,
  importInProgress,
  onImport,
  onPreview,
  pagination,
  onPageChange
}: CJProductGridProps) => {
  // État de chargement
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="kamri-card animate-pulse">
            <CardContent className="p-0">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // État vide
  if (products.length === 0) {
    return (
      <Card className="kamri-card">
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grille de produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <CJProductCard
            key={product.pid}
            product={product}
            onImport={() => onImport(product)}
            onPreview={() => onPreview(product)}
            importInProgress={importInProgress[product.pid] || false}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage de {((pagination.currentPage - 1) * pagination.pageSize) + 1} à{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalResults)} sur{' '}
            {pagination.totalResults} résultats
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1
                const isActive = page === pagination.currentPage
                return (
                  <Button
                    key={page}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={isActive ? "kamri-button" : ""}
                  >
                    {page}
                  </Button>
                )
              })}
              
              {pagination.totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}