'use client'

import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
    Edit,
    Eye,
    EyeOff,
    Filter,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  supplier?: { name: string }
  category?: { name: string }
  status: string
  badge?: string
  image?: string
  stock: number
  sales: number
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Toutes')
  const [selectedSupplier, setSelectedSupplier] = useState('Tous')
  const [showFilters, setShowFilters] = useState(false)
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

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les produits
      const productsResponse = await apiClient.getProducts()
      if (productsResponse.data) {
        setProducts(productsResponse.data)
      }

      // Charger les catégories
      const categoriesResponse = await apiClient.getCategories()
      if (categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])
      }

      // Charger les fournisseurs
      const suppliersResponse = await apiClient.getSuppliers()
      if (suppliersResponse.data) {
        setSuppliers(Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Connexion Requise</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Veuillez vous connecter pour accéder aux produits
              </p>
              <Button onClick={() => setShowLogin(true)}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  const getBadgeStyle = (badge: string | null) => {
    switch (badge) {
      case 'promo':
        return 'badge-promo'
      case 'top-ventes':
        return 'badge-top-ventes'
      case 'tendances':
        return 'badge-tendances'
      case 'nouveau':
        return 'badge-nouveau'
      default:
        return 'hidden'
    }
  }

  const getBadgeText = (badge: string | null) => {
    switch (badge) {
      case 'promo':
        return 'PROMO'
      case 'top-ventes':
        return 'TOP VENTES'
      case 'tendances':
        return 'TENDANCES'
      case 'nouveau':
        return 'NOUVEAU'
      default:
        return ''
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Toutes' || product.category?.name === selectedCategory
    const matchesSupplier = selectedSupplier === 'Tous' || product.supplier?.name === selectedSupplier
    return matchesSearch && matchesCategory && matchesSupplier
  })

  const categoryOptions = ['Toutes', ...(categories || []).map(cat => cat.name)]
  const supplierOptions = ['Tous', ...(suppliers || []).map(sup => sup.name)]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-2">Gérez vos produits importés</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => alert('Import de produits - Fonctionnalité à venir')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Importer Produits
        </Button>
      </div>

      {/* Filters */}
      <Card className="kamri-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {supplierOptions.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="kamri-card group">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center relative">
                <Package className="h-12 w-12 text-gray-400" />
                
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-3 left-3 ${getBadgeStyle(product.badge)}`}>
                    {getBadgeText(product.badge)}
                  </div>
                )}

                {/* Status Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                  onClick={() => alert(`Statut ${product.status === 'active' ? 'désactivé' : 'activé'}`)}
                >
                  {product.status === 'active' ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fournisseur:</span>
                    <span className="text-sm font-medium">{product.supplier?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <span className="text-sm font-medium">{product.stock}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Ventes:</span>
                    <span className="text-sm font-medium">{product.sales}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-primary-600">{product.price}€</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">{product.originalPrice}€</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="kamri-card">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
            <Button 
              className="kamri-button"
              onClick={() => alert('Import de produits - Fonctionnalité à venir')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Importer des produits
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
