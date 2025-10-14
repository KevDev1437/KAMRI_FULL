'use client'

import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
    CheckCircle,
    Download,
    Edit,
    Plus,
    TestTube,
    Trash2,
    Truck,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Supplier {
  id: string
  name: string
  apiUrl: string
  apiKey: string
  status: string
  description?: string
  lastSync?: string
  products?: any[]
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    description: '',
    apiUrl: '',
    apiKey: ''
  })
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [importingProducts, setImportingProducts] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadSuppliers()
    } else {
      setShowLogin(true)
    }
  }, [isAuthenticated])

  const loadSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSuppliers()
      if (response.data) {
        setSuppliers(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSupplier = async () => {
    try {
      if (editingSupplier) {
        // Mode édition
        const response = await apiClient.updateSupplier(editingSupplier.id, newSupplier)
        if (response.data) {
          setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? response.data : s))
          setShowAddModal(false)
          setEditingSupplier(null)
          setNewSupplier({ name: '', description: '', apiUrl: '', apiKey: '' })
        }
      } else {
        // Mode ajout
        const response = await apiClient.createSupplier(newSupplier)
        if (response.data) {
          setSuppliers([...suppliers, response.data])
          setShowAddModal(false)
          setNewSupplier({ name: '', description: '', apiUrl: '', apiKey: '' })
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du fournisseur:', error)
    }
  }

  const handleTestConnection = async (supplierId: string) => {
    try {
      setTestingConnection(supplierId)
      const response = await apiClient.testSupplierConnection(supplierId)
      
      if (response.data?.success) {
        alert('Connexion réussie !')
        loadSuppliers() // Recharger pour mettre à jour le statut
      } else {
        alert('Échec de la connexion')
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error)
      alert('Erreur lors du test de connexion')
    } finally {
      setTestingConnection(null)
    }
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setNewSupplier({
      name: supplier.name,
      description: supplier.description || '',
      apiUrl: supplier.apiUrl,
      apiKey: supplier.apiKey || ''
    })
    setEditingSupplier(supplier)
    setShowAddModal(true)
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await apiClient.deleteSupplier(supplierId)
        setSuppliers(suppliers.filter(s => s.id !== supplierId))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const handleImportProducts = async (supplierId: string) => {
    setImportingProducts(supplierId)
    try {
      const response = await apiClient.importProducts(supplierId)
      if (response.data) {
        alert(`✅ ${response.data.message}\n\n${response.data.products.length} produits importés et en attente de catégorisation.\n\nRegardez la console du backend pour voir les logs détaillés.`)
        // Pas de redirection - rester sur la page pour voir les logs
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      alert('❌ Erreur lors de l\'import des produits')
    } finally {
      setImportingProducts(null)
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
                Veuillez vous connecter pour accéder aux fournisseurs
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
          <p className="mt-4 text-gray-600">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-600 mt-2">Gérez vos connexions API</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un fournisseur
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="kamri-card group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <p className="text-sm text-gray-500">{supplier.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {supplier.status === 'connected' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Statut:</span>
                  <span className={`text-sm font-medium ${
                    supplier.status === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {supplier.status === 'connected' ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Produits:</span>
                  <span className="text-sm font-medium">{supplier.products?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Dernière sync:</span>
                  <span className="text-sm font-medium">
                    {supplier.lastSync ? new Date(supplier.lastSync).toLocaleDateString() : 'Jamais'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(supplier.id)}
                  disabled={testingConnection === supplier.id}
                  className="flex-1"
                >
                  <TestTube className="w-3 h-3 mr-1" />
                  {testingConnection === supplier.id ? 'Test...' : 'Tester'}
                </Button>
                {supplier.status === 'connected' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleImportProducts(supplier.id)}
                    disabled={importingProducts === supplier.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {importingProducts === supplier.id ? 'Import...' : 'Importer'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSupplier(supplier)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="Temu, AliExpress, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={newSupplier.description}
                  onChange={(e) => setNewSupplier({...newSupplier, description: e.target.value})}
                  placeholder="Description du fournisseur"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">URL API</label>
                <Input
                  value={newSupplier.apiUrl}
                  onChange={(e) => setNewSupplier({...newSupplier, apiUrl: e.target.value})}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Clé API</label>
                <Input
                  value={newSupplier.apiKey}
                  onChange={(e) => setNewSupplier({...newSupplier, apiKey: e.target.value})}
                  placeholder="votre_cle_api"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingSupplier(null)
                    setNewSupplier({ name: '', description: '', apiUrl: '', apiKey: '' })
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddSupplier}
                  className="flex-1"
                >
                  {editingSupplier ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {suppliers.length === 0 && (
        <Card className="kamri-card">
          <CardContent className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun fournisseur</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier fournisseur</p>
            <Button 
              className="kamri-button"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un fournisseur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}