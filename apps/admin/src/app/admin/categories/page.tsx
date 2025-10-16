'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    CheckCircle,
    Edit,
    FolderOpen,
    Link,
    Plus,
    Trash2,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { apiClient } from '../../../lib/api'

// Mock data
const categories = [
  {
    id: 1,
    name: 'Mode',
    description: 'Vêtements et accessoires de mode',
    productCount: 234,
    externalMappings: [
      { platform: 'Temu', externalName: 'Fashion & Clothing', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Women\'s Clothing', status: 'mapped' },
      { platform: 'Shein', externalName: 'Fashion', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: 'Technologie',
    description: 'Électronique et gadgets technologiques',
    productCount: 189,
    externalMappings: [
      { platform: 'Temu', externalName: 'Electronics', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Consumer Electronics', status: 'mapped' },
      { platform: 'Shein', externalName: 'Tech', status: 'mapped' }
    ]
  },
  {
    id: 3,
    name: 'Maison',
    description: 'Décoration et équipement de la maison',
    productCount: 156,
    externalMappings: [
      { platform: 'Temu', externalName: 'Home & Garden', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Home Improvement', status: 'pending' },
      { platform: 'Shein', externalName: 'Home', status: 'pending' }
    ]
  },
  {
    id: 4,
    name: 'Beauté',
    description: 'Produits de beauté et soins',
    productCount: 98,
    externalMappings: [
      { platform: 'Temu', externalName: 'Beauty & Health', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Beauty', status: 'mapped' },
      { platform: 'Shein', externalName: 'Beauty', status: 'mapped' }
    ]
  },
  {
    id: 5,
    name: 'Accessoires',
    description: 'Accessoires et petits objets',
    productCount: 167,
    externalMappings: [
      { platform: 'Temu', externalName: 'Accessories', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Jewelry & Accessories', status: 'pending' },
      { platform: 'Shein', externalName: 'Accessories', status: 'mapped' }
    ]
  },
  {
    id: 6,
    name: 'Sport',
    description: 'Équipement et vêtements de sport',
    productCount: 89,
    externalMappings: [
      { platform: 'Temu', externalName: 'Sports & Outdoors', status: 'pending' },
      { platform: 'AliExpress', externalName: 'Sports & Entertainment', status: 'mapped' },
      { platform: 'Shein', externalName: 'Sports', status: 'pending' }
    ]
  },
  {
    id: 7,
    name: 'Enfants',
    description: 'Produits pour enfants et bébés',
    productCount: 123,
    externalMappings: [
      { platform: 'Temu', externalName: 'Kids & Baby', status: 'mapped' },
      { platform: 'AliExpress', externalName: 'Mother & Kids', status: 'mapped' },
      { platform: 'Shein', externalName: 'Kids', status: 'pending' }
    ]
  }
]

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [mappings, setMappings] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [unmappedCategories, setUnmappedCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [selectedCategoryForMapping, setSelectedCategoryForMapping] = useState<any>(null)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<any>(null)
  const [mappingData, setMappingData] = useState({
    supplierId: '',
    externalCategory: '',
    internalCategory: ''
  })
  const [categoryData, setCategoryData] = useState({
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

  // Recharger les catégories non mappées quand le fournisseur change
  useEffect(() => {
    if (mappingData.supplierId) {
      loadUnmappedCategories()
    }
  }, [mappingData.supplierId])

  const loadUnmappedCategories = async () => {
    try {
      console.log('🔄 Rechargement des catégories non mappées...')
      const unmappedResponse = await apiClient.getUnmappedExternalCategories()
      console.log('📦 Réponse catégories non mappées:', unmappedResponse)
      
      if (unmappedResponse.data) {
        // Vérifier si c'est un objet avec une propriété data ou directement un tableau
        const categoriesData = unmappedResponse.data.data || unmappedResponse.data
        console.log('📂 Catégories non mappées rechargées:', categoriesData)
        
        if (Array.isArray(categoriesData)) {
          setUnmappedCategories(categoriesData)
        } else {
          console.log('❌ Les données ne sont pas un tableau:', categoriesData)
          setUnmappedCategories([])
        }
      } else {
        console.log('❌ Aucune catégorie non mappée trouvée')
        setUnmappedCategories([])
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des catégories non mappées:', error)
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les catégories
      const categoriesResponse = await apiClient.getCategories()
      console.log('📦 Réponse catégories:', categoriesResponse)
      
      if (categoriesResponse.data && categoriesResponse.data.data) {
        // Le backend retourne { data: [catégories], message: "..." }
        const categoriesData = Array.isArray(categoriesResponse.data.data) 
          ? categoriesResponse.data.data 
          : []
        console.log('📂 Catégories chargées:', categoriesData)
        setCategories(categoriesData)
      } else {
        console.log('❌ Aucune donnée reçue, utilisation des données de test')
        // Utiliser les données de test si l'API ne retourne rien
        setCategories([
          {
            id: 1,
            name: 'Mode',
            description: 'Vêtements et accessoires de mode',
            productCount: 234,
            externalMappings: [
              { platform: 'Temu', externalName: 'Fashion & Clothing', status: 'mapped' },
              { platform: 'AliExpress', externalName: 'Women\'s Clothing', status: 'mapped' },
              { platform: 'Shein', externalName: 'Fashion', status: 'pending' }
            ]
          },
          {
            id: 2,
            name: 'Technologie',
            description: 'Électronique et gadgets technologiques',
            productCount: 189,
            externalMappings: [
              { platform: 'Temu', externalName: 'Electronics', status: 'mapped' },
              { platform: 'AliExpress', externalName: 'Consumer Electronics', status: 'mapped' },
              { platform: 'Shein', externalName: 'Tech', status: 'mapped' }
            ]
          }
        ])
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
        setSuppliers(suppliersResponse.data)
      }

      // Charger les catégories externes non mappées
      await loadUnmappedCategories()
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMapping = async () => {
    try {
      const response = await apiClient.createCategoryMapping({
        supplierId: mappingData.supplierId,
        externalCategory: mappingData.externalCategory,
        internalCategory: mappingData.internalCategory
      })
      
      if (response.data) {
        alert('✅ Mapping créé avec succès !')
        setShowMappingModal(false)
        setMappingData({ supplierId: '', externalCategory: '', internalCategory: '' })
        loadData() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de la création du mapping:', error)
      alert('❌ Erreur lors de la création du mapping')
    }
  }

  const openMappingModal = (category: any) => {
    setSelectedCategoryForMapping(category)
    setMappingData({
      supplierId: '',
      externalCategory: '',
      internalCategory: category.name
    })
    setShowMappingModal(true)
  }

  const openEditModal = (category: any) => {
    setSelectedCategoryForEdit(category)
    setCategoryData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🛍️',
      color: category.color || '#4CAF50'
    })
    setShowEditCategoryModal(true)
  }

  const handleCreateCategory = async () => {
    try {
      const response = await apiClient.createCategory(categoryData)
      if (response.data) {
        alert('✅ Catégorie créée avec succès !')
        setShowAddCategoryModal(false)
        setCategoryData({ name: '', description: '', icon: '🛍️', color: '#4CAF50' })
        loadData()
      }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
      alert('❌ Erreur lors de la création de la catégorie')
    }
  }

  const handleUpdateCategory = async () => {
    try {
      const response = await apiClient.updateCategory(selectedCategoryForEdit.id, categoryData)
      if (response.data) {
        alert('✅ Catégorie modifiée avec succès !')
        setShowEditCategoryModal(false)
        loadData()
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la catégorie:', error)
      alert('❌ Erreur lors de la modification de la catégorie')
    }
  }

  const handleDeleteCategory = async (category: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      try {
        await apiClient.deleteCategory(category.id)
        alert('✅ Catégorie supprimée avec succès !')
        loadData()
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error)
        alert('❌ Erreur lors de la suppression de la catégorie')
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <XCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (showLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des catégories...</p>
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
          <p className="text-gray-600 mt-2">Gérez vos catégories et leurs mappings</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => setShowAddCategoryModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Catégorie
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && Array.isArray(categories) && categories.map((category) => (
          <Card 
            key={category.id} 
            className={`kamri-card cursor-pointer transition-all duration-200 ${
              selectedCategory === category.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-gray-500">{category.productCount || 0} produits</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              
              {/* External Mappings */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Mappings Externes</h4>
                {category.externalMappings && Array.isArray(category.externalMappings) ? (
                  category.externalMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{mapping.platform}</span>
                      <span className="text-xs text-gray-500">→</span>
                      <span className="text-sm text-gray-600">{mapping.externalName}</span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(mapping.status)}`}>
                      {getStatusIcon(mapping.status)}
                      <span className="capitalize">{mapping.status}</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Aucun mapping configuré</p>
                    <p className="text-xs text-gray-400 mt-1">Cliquez sur "Mapper" pour ajouter un mapping</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedCategory === category.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openMappingModal(category)}
                    >
                      <Link className="w-3 h-3 mr-1" />
                      Mapper
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mapping Instructions */}
      <Card className="kamri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-primary-500" />
            <span>Instructions de Mapping</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Le mapping des catégories permet de faire correspondre vos catégories internes 
              avec les catégories des plateformes externes (Temu, AliExpress, Shein, etc.).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Mappé</span>
                </div>
                <p className="text-xs text-green-600">Catégorie correctement liée</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">En attente</span>
                </div>
                <p className="text-xs text-yellow-600">Mapping en cours de configuration</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Non mappé</span>
                </div>
                <p className="text-xs text-gray-600">Aucun mapping configuré</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Mapping */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Créer un Mapping</h3>
            
            <div className="space-y-4">
              {/* Fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur
                </label>
                <select
                  value={mappingData.supplierId}
                  onChange={(e) => {
                    console.log('🔄 Fournisseur changé:', e.target.value)
                    setMappingData({...mappingData, supplierId: e.target.value, externalCategory: ''})
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catégorie externe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie externe détectée
                </label>
                <select
                  value={mappingData.externalCategory}
                  onChange={(e) => setMappingData({...mappingData, externalCategory: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner une catégorie détectée</option>
                  {(() => {
                    const filteredCategories = unmappedCategories && Array.isArray(unmappedCategories) 
                      ? unmappedCategories.filter(cat => cat.supplierId === mappingData.supplierId)
                      : []
                    console.log('🔍 Catégories filtrées pour le fournisseur', mappingData.supplierId, ':', filteredCategories)
                    return filteredCategories.map((category) => {
                      // Vérifier si cette catégorie a déjà un mapping
                      const hasMapping = mappings && Array.isArray(mappings) && mappings.some(mapping => 
                        mapping.supplierId === mappingData.supplierId && 
                        mapping.externalCategory === category.externalCategory
                      )
                      
                      return (
                        <option 
                          key={category.id} 
                          value={category.externalCategory}
                          disabled={hasMapping}
                          style={{ 
                            color: hasMapping ? '#999' : 'inherit',
                            backgroundColor: hasMapping ? '#f5f5f5' : 'inherit'
                          }}
                        >
                          {hasMapping ? '🔒 ' : ''}{category.externalCategory} ({category.productCount} produits)
                          {hasMapping ? ' - Déjà mappé' : ''}
                        </option>
                      )
                    })
                  })()}
                </select>
                {mappingData.supplierId && unmappedCategories && Array.isArray(unmappedCategories) && unmappedCategories.filter(cat => cat.supplierId === mappingData.supplierId).length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Aucune catégorie non mappée pour ce fournisseur
                  </p>
                )}
              </div>

              {/* Catégorie interne */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie interne
                </label>
                <input
                  type="text"
                  value={mappingData.internalCategory}
                  onChange={(e) => setMappingData({...mappingData, internalCategory: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Catégorie sélectionnée: {selectedCategoryForMapping?.name}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowMappingModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateMapping}
                disabled={!mappingData.supplierId || !mappingData.externalCategory}
                className="flex-1 kamri-button"
              >
                Créer Mapping
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de catégorie */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter une Catégorie</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Électronique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({...categoryData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Description de la catégorie"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône
                  </label>
                  <input
                    type="text"
                    value={categoryData.icon}
                    onChange={(e) => setCategoryData({...categoryData, icon: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="🛍️"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={categoryData.color}
                    onChange={(e) => setCategoryData({...categoryData, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddCategoryModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!categoryData.name}
                className="flex-1 kamri-button"
              >
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de catégorie */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier la Catégorie</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({...categoryData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône
                  </label>
                  <input
                    type="text"
                    value={categoryData.icon}
                    onChange={(e) => setCategoryData({...categoryData, icon: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={categoryData.color}
                    onChange={(e) => setCategoryData({...categoryData, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditCategoryModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={!categoryData.name}
                className="flex-1 kamri-button"
              >
                Modifier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
