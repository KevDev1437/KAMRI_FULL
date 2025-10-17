'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    CheckCircle,
    Edit,
    Link,
    Lock,
    Plus,
    Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiClient } from '../../../lib/api'

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  products?: any[];
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [mappings, setMappings] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [unmappedCategories, setUnmappedCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [selectedCategoryForMapping, setSelectedCategoryForMapping] = useState<any>(null)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null)
  const [mappingData, setMappingData] = useState({
    supplierId: '',
    externalCategory: '',
    internalCategory: ''
  })
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    icon: '🛍️',
    color: '#4CAF50'
  })
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
      
      // Charger les catégories
      const categoriesResponse = await apiClient.getCategories()
      if (categoriesResponse.data) {
        const backendData = categoriesResponse.data.data || categoriesResponse.data
        const categoriesData = Array.isArray(backendData) ? backendData : []
        setCategories(categoriesData)
      }

      // Charger les mappings
      const mappingsResponse = await apiClient.getCategoryMappings()
      if (mappingsResponse.data) {
        const mappingsData = mappingsResponse.data.data || mappingsResponse.data
        setMappings(Array.isArray(mappingsData) ? mappingsData : [])
      }

      // Charger les fournisseurs
      const suppliersResponse = await apiClient.getSuppliers()
      if (suppliersResponse.data) {
        const suppliersData = suppliersResponse.data.data || suppliersResponse.data
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
      }

      // Charger les catégories non mappées
      const unmappedResponse = await apiClient.getUnmappedExternalCategories()
      if (unmappedResponse.data) {
        const unmappedData = unmappedResponse.data.data || unmappedResponse.data
        setUnmappedCategories(Array.isArray(unmappedData) ? unmappedData : [])
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await apiClient.createCategory(newCategoryData)
      if (response.data) {
        await loadData() // Recharger toutes les données
        setShowAddCategoryModal(false)
        setNewCategoryData({ name: '', description: '', icon: '🛍️', color: '#4CAF50' })
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error)
    }
  }

  const handleEditCategory = async () => {
    if (!selectedCategoryForEdit) return
    
    try {
      const response = await apiClient.updateCategory(selectedCategoryForEdit.id, {
        name: selectedCategoryForEdit.name,
        description: selectedCategoryForEdit.description,
        icon: selectedCategoryForEdit.icon,
        color: selectedCategoryForEdit.color
      })
      if (response.data) {
        await loadData() // Recharger toutes les données
        setShowEditCategoryModal(false)
        setSelectedCategoryForEdit(null)
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la catégorie:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string, isDefault: boolean) => {
    if (isDefault) {
      alert('Impossible de supprimer une catégorie par défaut')
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      await apiClient.deleteCategory(categoryId)
      await loadData() // Recharger toutes les données
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error)
      alert('Erreur lors de la suppression de la catégorie')
    }
  }

  const handleCreateMapping = async () => {
    try {
      const response = await apiClient.createCategoryMapping(mappingData)
      if (response.data) {
        await loadData() // Recharger toutes les données
        setShowMappingModal(false)
        setMappingData({ supplierId: '', externalCategory: '', internalCategory: '' })
        setSelectedCategoryForMapping(null)
      }
    } catch (error) {
      console.error('Erreur lors de la création du mapping:', error)
    }
  }

  const getCategoryMappings = (categoryId: string) => {
    return mappings.filter(mapping => mapping.internalCategory === categoryId)
  }

  const getUnmappedForCategory = (categoryId: string) => {
    return unmappedCategories.filter(unmapped => 
      !mappings.some(mapping => 
        mapping.supplierId === unmapped.supplierId && 
        mapping.externalCategory === unmapped.externalCategory
      )
    )
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
                Veuillez vous connecter pour accéder aux catégories
              </p>
              <Button onClick={() => setShowLogin(true)}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600 mt-2">Gérez les catégories et leurs mappings</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => setShowAddCategoryModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(categories) && categories.map((category) => {
          const categoryMappings = getCategoryMappings(category.id)
          const unmappedForCategory = getUnmappedForCategory(category.id)
          
          return (
            <Card key={category.id} className="kamri-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {category.name}
                        {category.isDefault && (
                          <Lock className="w-4 h-4 text-blue-500" title="Catégorie par défaut" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {category.products?.length || 0} produits
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description || 'Aucune description'}
                </p>
                
                {/* Mappings Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Mappings externes</h4>
                  
                  {/* Mappings existants - Dropdown compact */}
                  {categoryMappings.length > 0 && (
                    <div className="mb-2">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-xs bg-green-50 p-2 rounded hover:bg-green-100 transition-colors">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-green-700 font-medium">
                              {categoryMappings.length} mapping{categoryMappings.length > 1 ? 's' : ''} configuré{categoryMappings.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-green-600 text-xs">▼</span>
                        </summary>
                        <div className="mt-2 space-y-1 pl-4">
                          {categoryMappings.map((mapping, index) => (
                            <div key={index} className="flex items-center justify-between bg-green-25 p-1 rounded text-xs">
                              <span className="text-green-600">
                                {mapping.supplier?.name}: {mapping.externalCategory}
                              </span>
                              <span className="text-green-500 text-xs">✓</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  
                  {/* Bouton pour mapper */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSelectedCategoryForMapping(category)
                      setMappingData({
                        ...mappingData,
                        internalCategory: category.name
                      })
                      setShowMappingModal(true)
                    }}
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Gérer les mappings
                  </Button>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategoryForEdit(category)
                        setShowEditCategoryModal(true)
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={category.isDefault ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-700"}
                      onClick={() => handleDeleteCategory(category.id, category.isDefault || false)}
                      disabled={category.isDefault}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {category.isDefault && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Par défaut
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Ajouter une catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCategoryData.description}
                  onChange={(e) => setNewCategoryData({...newCategoryData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Description de la catégorie"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <input
                    type="text"
                    value={newCategoryData.icon}
                    onChange={(e) => setNewCategoryData({...newCategoryData, icon: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="🛍️"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <input
                    type="color"
                    value={newCategoryData.color}
                    onChange={(e) => setNewCategoryData({...newCategoryData, color: e.target.value})}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAddCategory}
                  className="flex-1"
                  disabled={!newCategoryData.name}
                >
                  Ajouter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategoryForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Modifier la catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={selectedCategoryForEdit.name}
                  onChange={(e) => setSelectedCategoryForEdit({...selectedCategoryForEdit, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedCategoryForEdit.description || ''}
                  onChange={(e) => setSelectedCategoryForEdit({...selectedCategoryForEdit, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <input
                    type="text"
                    value={selectedCategoryForEdit.icon || ''}
                    onChange={(e) => setSelectedCategoryForEdit({...selectedCategoryForEdit, icon: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <input
                    type="color"
                    value={selectedCategoryForEdit.color || '#4CAF50'}
                    onChange={(e) => setSelectedCategoryForEdit({...selectedCategoryForEdit, color: e.target.value})}
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleEditCategory}
                  className="flex-1"
                  disabled={!selectedCategoryForEdit.name}
                >
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditCategoryModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && selectedCategoryForMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Gérer les mappings pour {selectedCategoryForMapping.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fournisseur</label>
                <select
                  value={mappingData.supplierId}
                  onChange={(e) => setMappingData({...mappingData, supplierId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie externe</label>
                <select
                  value={mappingData.externalCategory}
                  onChange={(e) => setMappingData({...mappingData, externalCategory: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner une catégorie externe</option>
                  {unmappedCategories
                    .filter(unmapped => unmapped.supplierId === mappingData.supplierId)
                    .map(unmapped => {
                      // Vérifier si cette catégorie externe est déjà mappée
                      const isAlreadyMapped = mappings.some(mapping => 
                        mapping.supplierId === unmapped.supplierId && 
                        mapping.externalCategory === unmapped.externalCategory
                      );
                      
                      return (
                        <option 
                          key={unmapped.id} 
                          value={unmapped.externalCategory}
                          disabled={isAlreadyMapped}
                          style={{ 
                            color: isAlreadyMapped ? '#9CA3AF' : 'inherit',
                            backgroundColor: isAlreadyMapped ? '#F3F4F6' : 'inherit'
                          }}
                        >
                          {unmapped.externalCategory} ({unmapped.productCount} produits)
                          {isAlreadyMapped && ' - Déjà mappé'}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCreateMapping}
                  className="flex-1"
                  disabled={!mappingData.supplierId || !mappingData.externalCategory}
                >
                  Créer le mapping
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMappingModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}