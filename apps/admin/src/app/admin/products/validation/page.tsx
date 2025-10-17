'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Check, Package, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  category?: { name: string }
  supplier?: { name: string }
  status: string
  badge?: string
  stock: number
  sales: number
}

export default function ProductValidationPage() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    } else {
      setShowLogin(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      loadPendingProducts()
    }
  }, [selectedCategoryId, isAuthenticated])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les catégories
      const categoriesResponse = await apiClient.getCategories()
      if (categoriesResponse.data) {
        const categoriesData = categoriesResponse.data.data || categoriesResponse.data
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      }
      
      // Charger les produits
      await loadPendingProducts()
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingProducts = async () => {
    try {
      const response = await apiClient.getProductsReadyForValidation(selectedCategoryId || undefined)
      if (response.data) {
        // L'API retourne { data: [...], message: "..." }, on doit extraire data
        const productsData = response.data.data || response.data;
        // S'assurer que productsData est un tableau
        const productsArray = Array.isArray(productsData) ? productsData : [];
        setPendingProducts(productsArray);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits prêts pour validation:', error)
    }
  }

  const approveProduct = async (id: string) => {
    try {
      await apiClient.approveProduct(id)
      setPendingProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }

  const rejectProduct = async (id: string) => {
    try {
      await apiClient.rejectProduct(id)
      setPendingProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à cette page.</p>
          <Button onClick={() => setShowLogin(true)}>Se connecter</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits en attente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validation des Produits</h1>
          <p className="text-gray-600 mt-2">
            {pendingProducts.length} produit(s) catégorisés prêts pour validation
          </p>
        </div>
      </div>

      {/* Filtre par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrer par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryId('')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategoryId === ''
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Toutes ({pendingProducts.length})
            </button>
            {categories && Array.isArray(categories) && categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {pendingProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit en attente</h3>
            <p className="text-gray-600">Tous les produits ont été validés.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    En attente
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prix:</span>
                    <span className="font-semibold text-green-600">
                      {product.price.toFixed(2)}€
                    </span>
                  </div>
                  
                  {product.originalPrice && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prix original:</span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.originalPrice.toFixed(2)}€
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className="text-sm font-medium">{product.stock}</span>
                  </div>
                  
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Catégorie:</span>
                      <span className="text-sm">{product.category.name}</span>
                    </div>
                  )}
                  
                  {product.supplier && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fournisseur:</span>
                      <span className="text-sm">{product.supplier.name}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => approveProduct(product.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  
                  <Button
                    onClick={() => rejectProduct(product.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
