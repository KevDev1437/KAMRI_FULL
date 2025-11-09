'use client'

import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { apiClient } from '@/lib/api'
import {
  Edit,
  Eye,
  Package,
  Save,
  Send,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Image as ImageIcon,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DraftProduct {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  margin?: number
  image?: string
  images?: Array<{ id: string; url: string }>
  categoryId?: string
  category?: { id: string; name: string }
  supplierId?: string
  supplier?: { id: string; name: string }
  badge?: string
  stock: number
  status: string
  isEdited: boolean
  editedAt?: string
  editedBy?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function DraftProductsPage() {
  const [drafts, setDrafts] = useState<DraftProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<DraftProduct>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const router = useRouter()

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

      // Charger les produits draft
      console.log('🔄 Chargement des produits draft...')
      const draftsResponse = await apiClient.getDraftProducts()
      console.log('📦 Réponse API getDraftProducts complète:', JSON.stringify(draftsResponse, null, 2))
      
      let draftsList: DraftProduct[] = []
      
      if (draftsResponse && draftsResponse.data) {
        // Structure: { data: [...] }
        const draftsData = draftsResponse.data
        if (Array.isArray(draftsData)) {
          draftsList = draftsData
        } else if (draftsData && typeof draftsData === 'object' && 'data' in draftsData) {
          // Structure imbriquée: { data: { data: [...] } }
          draftsList = Array.isArray(draftsData.data) ? draftsData.data : []
        } else {
          draftsList = []
        }
      } else if (Array.isArray(draftsResponse)) {
        // Réponse directe: [...]
        draftsList = draftsResponse
      } else if (draftsResponse && typeof draftsResponse === 'object' && !draftsResponse.error) {
        // Autre structure
        console.warn('⚠️ [DRAFT-PRODUCTS] Structure inattendue:', draftsResponse)
        draftsList = []
      } else {
        console.warn('⚠️ [DRAFT-PRODUCTS] Pas de données ou erreur:', draftsResponse)
        draftsList = []
      }
      
      console.log('📝 [DRAFT-PRODUCTS] Produits draft chargés:', draftsList.length)
      console.log('📝 [DRAFT-PRODUCTS] Produits:', draftsList)
      setDrafts(draftsList)

      // Charger les catégories
      const categoriesResponse = await apiClient.getCategories()
      if (categoriesResponse.data) {
        const categoriesData = categoriesResponse.data.data || categoriesResponse.data
        const categoriesList = Array.isArray(categoriesData) ? categoriesData : []
        setCategories(categoriesList)
      }

      // Charger les fournisseurs
      const suppliersResponse = await apiClient.getSuppliers()
      if (suppliersResponse.data) {
        const suppliersData = suppliersResponse.data.data || suppliersResponse.data
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : []
        setSuppliers(suppliersList)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.showToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de charger les produits draft'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: DraftProduct) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description || '',
      margin: product.margin || 30,
      categoryId: product.categoryId || '',
      image: product.image || '',
      badge: product.badge || 'none',
      stock: product.stock || 0,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async (id: string) => {
    try {
      setIsSaving(true)

      const response = await apiClient.editDraftProduct(id, {
        name: formData.name,
        description: formData.description,
        margin: formData.margin,
        categoryId: formData.categoryId,
        image: formData.image,
        badge: formData.badge === 'none' ? undefined : formData.badge,
        stock: formData.stock,
      })

      if (response.data) {
        toast.showToast({
          type: 'success',
          title: 'Succès',
          description: 'Produit édité avec succès'
        })
        setEditingId(null)
        setFormData({})
        loadData()
      } else {
        toast.showToast({
          type: 'error',
          title: 'Erreur',
          description: response.error || 'Impossible d\'éditer le produit'
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error)
      toast.showToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible d\'éditer le produit'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir publier ce produit ? Il sera visible dans le catalogue.')) {
      return
    }

    try {
      setIsPublishing(true)

      const response = await apiClient.publishProduct(id)

      if (response.data) {
        toast.showToast({
          type: 'success',
          title: 'Succès',
          description: 'Produit publié avec succès'
        })
        loadData()
      } else {
        toast.showToast({
          type: 'error',
          title: 'Erreur',
          description: response.error || 'Impossible de publier le produit'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
      toast.showToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de publier le produit'
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUpdateMappings = async () => {
    if (!confirm('Mettre à jour automatiquement les produits draft sans catégorie qui ont un mapping ?')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await apiClient.updateDraftProductsWithMapping()

      if (response.data) {
        const { total, updated } = response.data
        toast.showToast({
          type: 'success',
          title: 'Succès',
          description: `${updated} produit(s) mis à jour sur ${total} trouvé(s)`
        })
        loadData() // Recharger les produits
      } else {
        toast.showToast({
          type: 'error',
          title: 'Erreur',
          description: response.error || 'Impossible de mettre à jour les produits'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des mappings:', error)
      toast.showToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de mettre à jour les produits'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = (originalPrice?: number, margin?: number) => {
    if (!originalPrice || !margin) return 0
    return originalPrice * (1 + margin / 100)
  }

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
                Veuillez vous connecter pour accéder aux produits draft
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
          <p className="mt-4 text-gray-600">Chargement des produits draft...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits en Draft</h1>
          <p className="text-gray-600 mt-2">
            Éditez et publiez vos produits avant de les rendre visibles dans le catalogue
          </p>
        </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadData}>
              <Package className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              onClick={handleUpdateMappings}
              title="Mettre à jour automatiquement les produits draft sans catégorie qui ont un mapping"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mettre à jour les catégories
            </Button>
            <Link href="/admin/products">
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Voir tous les produits
              </Button>
            </Link>
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="kamri-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Draft</p>
                <p className="text-2xl font-bold text-gray-900">{drafts.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="kamri-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Édités</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drafts.filter(p => p.isEdited).length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="kamri-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prêts à publier</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drafts.filter(p => p.categoryId && p.name && p.price > 0).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      {drafts.length === 0 ? (
        <Card className="kamri-card">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit en draft</h3>
            <p className="text-gray-500 mb-4">
              Préparez des produits CJ pour commencer à les éditer
            </p>
            <Link href="/admin/stores">
              <Button className="kamri-button">
                <Package className="w-4 h-4 mr-2" />
                Voir les magasins
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((product) => (
            <Card key={product.id} className="kamri-card">
              <CardContent className="p-6">
                {editingId === product.id ? (
                  // Mode édition
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Édition du produit</h3>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Colonne gauche */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nom du produit *</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nom du produit"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description du produit"
                            rows={6}
                          />
                        </div>

                        <div>
                          <Label htmlFor="categoryId">Catégorie *</Label>
                          <Select
                            value={formData.categoryId || undefined}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="image">Image principale</Label>
                          <Input
                            id="image"
                            value={formData.image || ''}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="URL de l'image"
                          />
                        </div>
                      </div>

                      {/* Colonne droite */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="margin">Marge (%) *</Label>
                          <Input
                            id="margin"
                            type="number"
                            min="0"
                            max="500"
                            value={formData.margin || 30}
                            onChange={(e) => {
                              const margin = Number(e.target.value)
                              setFormData({
                                ...formData,
                                margin,
                                // Recalculer le prix si originalPrice existe
                                price: product.originalPrice ? calculatePrice(product.originalPrice, margin) : formData.price
                              })
                            }}
                          />
                          {product.originalPrice && (
                            <p className="text-sm text-gray-500 mt-1">
                              Prix calculé: {calculatePrice(product.originalPrice, formData.margin || 30).toFixed(2)}€
                              (Prix original: {product.originalPrice}€)
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.stock || 0}
                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="badge">Badge</Label>
                          <Select
                            value={formData.badge || 'none'}
                            onValueChange={(value) => setFormData({ ...formData, badge: value === 'none' ? '' : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Aucun badge" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun badge</SelectItem>
                              <SelectItem value="nouveau">Nouveau</SelectItem>
                              <SelectItem value="promo">Promo</SelectItem>
                              <SelectItem value="top-ventes">Top ventes</SelectItem>
                              <SelectItem value="tendances">Tendances</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Aperçu de l'image */}
                        {formData.image && (
                          <div>
                            <Label>Aperçu de l'image</Label>
                            <div className="mt-2 border rounded-lg p-2">
                              <img
                                src={formData.image}
                                alt="Aperçu"
                                className="w-full h-48 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Annuler
                      </Button>
                      <Button
                        className="kamri-button"
                        onClick={() => handleSave(product.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getCleanImageUrl(product.image) ? (
                        <img
                          src={getCleanImageUrl(product.image) || ''}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        {product.isEdited && (
                          <div className="flex items-center space-x-1 text-xs text-blue-600">
                            <Edit className="h-3 w-3" />
                            <span>Édité</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Prix:</span>
                          <span className="font-semibold ml-2">
                            {product.price.toFixed(2)}€
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through ml-2">
                              {product.originalPrice}€
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Marge:</span>
                          <span className="font-semibold ml-2">
                            {product.margin || 30}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Catégorie:</span>
                          <span className="font-semibold ml-2">
                            {product.category?.name || 'Non assignée'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="font-semibold ml-2">{product.stock}</span>
                        </div>
                      </div>

                      {product.badge && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            {product.badge}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Éditer
                        </Button>
                        <Button
                          className="kamri-button"
                          size="sm"
                          onClick={() => handlePublish(product.id)}
                          disabled={isPublishing || !product.categoryId || !product.name || product.price <= 0}
                        >
                          {isPublishing ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Publication...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1" />
                              Publier
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

