'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { CJProduct, SearchFilters, SearchState } from '@/types/cj'
import { Filter, Globe } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CJProductGrid } from './CJProductGrid'
import { CJProductPreview } from './CJProductPreview'
import { CJSearchFilters } from './CJSearchFilters'

// Hook personnalisé pour le debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const CJSearchDashboard = () => {
  // État initial
  const [searchState, setSearchState] = useState<SearchState>({
    filters: {
      keyword: '',
      category: 'ALL',
      minPrice: 0,
      maxPrice: 1000,
      stockCountry: 'ALL',
      minStock: 0,
      deliveryTime: 'ALL',
      freeShippingOnly: false,
      sortBy: 'popularity',
      productType: 'ALL'
    },
    results: [],
    categories: [],
    loading: false,
    searchInProgress: false,
    importInProgress: {},
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      pageSize: 50
    }
  })

  const [selectedProduct, setSelectedProduct] = useState<CJProduct | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Debounce pour la recherche automatique
  const debouncedKeyword = useDebounce(searchState.filters.keyword, 500)

  // Charger les catégories CJ au montage
  useEffect(() => {
    loadCJCategories()
  }, [])

  // Recherche automatique quand le mot-clé change
  useEffect(() => {
    if (debouncedKeyword.length > 2) {
      searchProducts()
    }
  }, [debouncedKeyword])

  // Fonction pour charger les catégories CJ
  const loadCJCategories = async () => {
    try {
      const response = await apiClient.getCJCategories()
      if (response.data?.success) {
        setSearchState(prev => ({
          ...prev,
          categories: response.data.data || []
        }))
      }
    } catch (error) {
      console.error('Erreur chargement catégories CJ:', error)
    }
  }

  // Fonction de recherche principale
  const searchProducts = async (page: number = 1) => {
    try {
      setSearchState(prev => ({
        ...prev,
        searchInProgress: true,
        loading: true
      }))

      // Convertir les filtres vers le format attendu par l'API
      const apiFilters = {
        keyword: searchState.filters.keyword,
        category: searchState.filters.category,
        minPrice: searchState.filters.minPrice,
        maxPrice: searchState.filters.maxPrice,
        stockCountry: searchState.filters.stockCountry,
        minStock: searchState.filters.minStock,
        deliveryTime: searchState.filters.deliveryTime,
        freeShippingOnly: searchState.filters.freeShippingOnly,
        productType: searchState.filters.productType,
        sortBy: searchState.filters.sortBy,
        pageNum: page,
        pageSize: searchState.pagination.pageSize
      }

      console.log('🔍 [CJ-SEARCH] Filtres envoyés:', apiFilters)
      const response = await apiClient.searchCJProductsAdvanced(apiFilters)
      console.log('📡 [CJ-SEARCH] Réponse API:', response)

      if (response.data?.success) {
        const data = response.data.data
        setSearchState(prev => ({
          ...prev,
          results: data.list || [],
          pagination: {
            ...prev.pagination,
            currentPage: page,
            totalPages: Math.ceil((data.total || 0) / searchState.pagination.pageSize),
            totalResults: data.total || 0
          }
        }))
      }
    } catch (error) {
      console.error('Erreur recherche CJ:', error)
    } finally {
      setSearchState(prev => ({
        ...prev,
        searchInProgress: false,
        loading: false
      }))
    }
  }

  // Fonction pour gérer les changements de filtres
  const handleFiltersChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }))
  }, [])

  // Fonction pour déclencher une recherche manuelle
  const handleSearch = useCallback(() => {
    searchProducts(1)
  }, [searchState.filters])

  // Fonction pour importer un produit
  const handleImport = async (product: CJProduct) => {
    try {
      setSearchState(prev => ({
        ...prev,
        importInProgress: { ...prev.importInProgress, [product.pid]: true }
      }))

      const response = await apiClient.importCJProduct({
        pid: product.pid,
        variantSku: product.variants?.[0]?.variantSku || product.productSku,
        categoryId: '', // À implémenter avec les catégories locales
        supplierId: '' // À implémenter avec les fournisseurs
      })

      if (response.data?.success) {
        console.log('✅ Produit importé avec succès:', product.productName)
        // TODO: Remplacer par un système de toast
        alert('Produit importé avec succès !')
      } else {
        console.error('❌ Erreur import:', response.data?.error)
        alert('Erreur lors de l\'import: ' + (response.data?.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('❌ Erreur import produit:', error)
      alert('Erreur lors de l\'import du produit')
    } finally {
      setSearchState(prev => ({
        ...prev,
        importInProgress: { ...prev.importInProgress, [product.pid]: false }
      }))
    }
  }

  // Fonction pour prévisualiser un produit
  const handlePreview = (product: CJProduct) => {
    setSelectedProduct(product)
    setPreviewOpen(true)
  }

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    searchProducts(page)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            Recherche CJ Dropshipping
          </h1>
          <p className="text-gray-600 mt-2">
            Recherchez et importez des produits depuis le catalogue CJ Dropshipping
          </p>
        </div>
      </div>

      {/* Filtres de recherche */}
      <Card className="kamri-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CJSearchFilters
            filters={searchState.filters}
            categories={searchState.categories}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            loading={searchState.searchInProgress}
          />
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="space-y-4">
        {/* Informations sur les résultats */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {searchState.pagination.totalResults > 0 ? (
              <>
                {searchState.pagination.totalResults} produit{searchState.pagination.totalResults > 1 ? 's' : ''} trouvé{searchState.pagination.totalResults > 1 ? 's' : ''}
                {searchState.filters.keyword && ` pour "${searchState.filters.keyword}"`}
              </>
            ) : (
              'Aucun produit trouvé'
            )}
          </div>
          <div className="text-sm text-gray-500">
            Page {searchState.pagination.currentPage} sur {searchState.pagination.totalPages}
          </div>
        </div>

        {/* Grille de produits */}
        <CJProductGrid
          products={searchState.results}
          loading={searchState.loading}
          importInProgress={searchState.importInProgress}
          onImport={handleImport}
          onPreview={handlePreview}
          pagination={searchState.pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal de prévisualisation */}
      {selectedProduct && (
        <CJProductPreview
          product={selectedProduct}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onImport={handleImport}
          importInProgress={searchState.importInProgress[selectedProduct.pid] || false}
        />
      )}
    </div>
  )
}
