'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Package, Plus, RefreshCw, ShoppingCart, Trash2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  cjProductId?: string | null
  source?: string | null
  productVariants?: Array<{
    id: string
    cjVariantId: string | null
    sku: string | null
  }>
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  // ID de l'utilisateur de test par défaut (créé par le script)
  const [selectedUserId, setSelectedUserId] = useState('cmhtvzabo0000je0o8qr3l6m3')
  const [syncingProducts, setSyncingProducts] = useState<Set<string>>(new Set())
  const [isSyncingAll, setIsSyncingAll] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/orders')
      return
    }
    loadProducts()
    loadCurrentUser()
  }, [isAuthenticated])

  const loadCurrentUser = async () => {
    try {
      // Chercher d'abord l'utilisateur de test (test@kamri.com)
      const usersResponse = await apiClient.getUsers?.()
      console.log('📋 Réponse getUsers:', usersResponse)
      
      // Gérer différentes structures de réponse
      const users = usersResponse?.data?.data || usersResponse?.data || []
      
      if (Array.isArray(users) && users.length > 0) {
        console.log(`📋 ${users.length} utilisateur(s) trouvé(s)`)
        
        // Chercher l'utilisateur de test en priorité
        const testUser = users.find((u: any) => u.email === 'test@kamri.com')
        if (testUser) {
          setSelectedUserId(testUser.id)
          console.log('✅ Utilisateur de test chargé:', testUser.email, testUser.id)
          return
        }
        
        // Sinon, prendre le premier utilisateur disponible
        const firstUser = users[0]
        if (firstUser) {
          setSelectedUserId(firstUser.id)
          console.log('✅ Premier utilisateur chargé:', firstUser.email, firstUser.id)
        }
      } else {
        console.warn('⚠️ Aucun utilisateur trouvé dans la réponse')
        // Fallback: utiliser l'ID de l'utilisateur de test connu
        setSelectedUserId('cmhtvzabo0000je0o8qr3l6m3')
        console.log('⚠️ Utilisation ID utilisateur de test par défaut')
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error)
      // Fallback: utiliser l'ID de l'utilisateur de test si connu
      setSelectedUserId('cmhtvzabo0000je0o8qr3l6m3')
      console.log('⚠️ Utilisation ID utilisateur de test en fallback')
    }
  }

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      // Utiliser getAllProductsForAdmin pour inclure les produits draft (où sont les produits CJ)
      const response = await apiClient.getAllProductsForAdmin?.() || await apiClient.getProducts?.()
      if (response?.data) {
        const productsData = Array.isArray(response.data) ? response.data : response.data.data || []
        
        // Filtrer uniquement les produits qui ont des variants
        const productsWithVariants = productsData.filter((product: any) => {
          // Vérifier si le produit a des variants
          const hasVariants = product.productVariants && 
                             Array.isArray(product.productVariants) && 
                             product.productVariants.length > 0
          
          // Pour les produits CJ, on exige qu'ils aient des variants
          const isCJ = product.source === 'cj-dropshipping' || product.cjProductId !== null
          
          if (isCJ) {
            // Produits CJ : doivent avoir des variants
            return hasVariants
          } else {
            // Produits non-CJ : on les garde aussi (ils peuvent ne pas avoir de variants)
            return true
          }
        })
        
        setProducts(productsWithVariants)
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncProductVariants = async (productId: string) => {
    try {
      setSyncingProducts(prev => new Set(prev).add(productId))
      
      const response = await apiClient.syncProductVariants(productId)
      
      console.log('Réponse sync variants:', response)
      
      // Vérifier différentes structures de réponse
      const success = response?.success !== false && 
                     response?.data?.success !== false &&
                     (response?.data?.data?.updated !== undefined || response?.data?.updated !== undefined)
      
      if (success) {
        const updated = response?.data?.data?.updated || response?.data?.updated || 0
        alert(`✅ Variants synchronisés avec succès !\n${updated} variant(s) créé(s)/mis à jour.`)
        // Recharger les produits pour voir les nouveaux variants
        await loadProducts()
      } else {
        const message = response?.data?.message || response?.message || 'Erreur lors de la synchronisation'
        alert(`⚠️ ${message}`)
      }
    } catch (error: any) {
      console.error('Erreur synchronisation variants:', error)
      const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Impossible de synchroniser les variants'
      alert(`❌ Erreur: ${errorMessage}`)
    } finally {
      setSyncingProducts(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const syncAllCJProductsVariants = async () => {
    if (!confirm('Synchroniser les variants de TOUS les produits CJ ?\n\nCela peut prendre plusieurs minutes.')) {
      return
    }

    try {
      setIsSyncingAll(true)
      
      const response = await apiClient.syncAllProductsVariants()
      
      console.log('Réponse sync all variants:', response)
      
      const success = response?.success !== false && 
                     response?.data?.success !== false
      
      if (success) {
        const data = response?.data?.data || response?.data || {}
        alert(
          `✅ Synchronisation terminée !\n\n` +
          `Produits synchronisés: ${data.synced || 0}\n` +
          `Variants créés/mis à jour: ${data.totalVariants || 0}\n` +
          `Échecs: ${data.failed || 0}`
        )
        // Recharger les produits
        await loadProducts()
      } else {
        const message = response?.data?.message || response?.message || 'Erreur lors de la synchronisation'
        alert(`⚠️ ${message}`)
      }
    } catch (error: any) {
      console.error('Erreur synchronisation tous variants:', error)
      const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Impossible de synchroniser les variants'
      alert(`❌ Erreur: ${errorMessage}`)
    } finally {
      setIsSyncingAll(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }])
    }
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ))
  }

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      alert('Veuillez ajouter au moins un produit à la commande')
      return
    }

    if (!selectedUserId) {
      alert('Veuillez sélectionner un utilisateur avec une adresse.\n\nPour créer un utilisateur de test, exécutez:\nnpx ts-node server/create-test-user-with-address.ts')
      return
    }

    try {
      setIsCreating(true)
      
      // Préparer les items pour l'API
      const items = orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))

      // Créer la commande
      const response = await apiClient.createOrder(items)
      
      if (response?.data) {
        alert(`✅ Commande créée avec succès !\nID: ${response.data.id}\n\nLa commande CJ sera créée automatiquement si elle contient des produits CJ.`)
        router.push('/admin/orders')
      }
    } catch (error: any) {
      console.error('Erreur création commande:', error)
      alert(`❌ Erreur: ${error.message || 'Impossible de créer la commande'}`)
    } finally {
      setIsCreating(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/orders')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux commandes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Créer une commande</h1>
          <p className="text-gray-600 mt-2">Créez une commande de test pour vérifier l'intégration CJ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des produits */}
        <div className="lg:col-span-2">
          <Card className="kamri-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produits disponibles</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncAllCJProductsVariants}
                  disabled={isSyncingAll}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {isSyncingAll ? 'Synchronisation...' : 'Sync tous variants CJ'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Products List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">Aucun produit avec variants disponible</p>
                    <p className="text-sm mt-1">Les produits CJ doivent avoir des variants synchronisés</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={syncAllCJProductsVariants}
                      disabled={isSyncingAll}
                      className="mt-4"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {isSyncingAll ? 'Synchronisation...' : 'Synchroniser tous les variants CJ'}
                    </Button>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isCJ = product.source === 'cj-dropshipping' || product.cjProductId !== null
                    const hasVariant = product.productVariants && product.productVariants.length > 0
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{product.name}</span>
                          {isCJ && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                              CJ
                            </span>
                          )}
                          {!hasVariant && isCJ && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              ⚠️ Pas de variant
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          ID: {product.id} • {product.price}€
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!hasVariant && isCJ && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncProductVariants(product.id)}
                            disabled={syncingProducts.has(product.id)}
                            className="text-xs"
                            title="Synchroniser les variants depuis CJ"
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${syncingProducts.has(product.id) ? 'animate-spin' : ''}`} />
                            {syncingProducts.has(product.id) ? 'Sync...' : 'Sync'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => addProductToOrder(product)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panier / Résumé */}
        <div className="lg:col-span-1">
          <Card className="kamri-card sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Commande ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Panier vide</p>
                  <p className="text-sm">Ajoutez des produits à gauche</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {orderItems.map((item) => {
                      const product = products.find(p => p.id === item.productId)
                      const isCJ = product?.source === 'cj-dropshipping' || product?.cjProductId !== null
                      
                      return (
                        <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-gray-500">
                              {item.price}€ {isCJ && <span className="text-purple-600">• CJ</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">{total.toFixed(2)}€</span>
                    </div>

                    {orderItems.some(item => {
                      const product = products.find(p => p.id === item.productId)
                      return product?.source === 'cj-dropshipping' || product?.cjProductId !== null
                    }) && (
                      <div className="mb-4 p-2 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                        ✅ Cette commande contient des produits CJ. La commande CJ sera créée automatiquement.
                      </div>
                    )}

                    <Button
                      onClick={handleCreateOrder}
                      disabled={isCreating || orderItems.length === 0}
                      className="w-full"
                    >
                      {isCreating ? 'Création...' : 'Créer la commande'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

