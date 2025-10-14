'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    CheckCircle,
    Edit,
    ExternalLink,
    Plus,
    Settings,
    TestTube,
    Trash2,
    Truck,
    XCircle
} from 'lucide-react'
import { useState } from 'react'

// Mock data
const suppliers = [
  {
    id: 1,
    name: 'Temu',
    url: 'https://api.temu.com',
    apiKey: 'temu_****_****',
    status: 'connected',
    productsCount: 1247,
    lastSync: 'Il y a 2 heures',
    description: 'Plateforme de dropshipping chinoise'
  },
  {
    id: 2,
    name: 'AliExpress',
    url: 'https://api.aliexpress.com',
    apiKey: 'aliexpress_****_****',
    status: 'connected',
    productsCount: 892,
    lastSync: 'Il y a 1 heure',
    description: 'Marketplace international d\'AliExpress'
  },
  {
    id: 3,
    name: 'Shein',
    url: 'https://api.shein.com',
    apiKey: 'shein_****_****',
    status: 'disconnected',
    productsCount: 0,
    lastSync: 'Jamais',
    description: 'Plateforme de mode rapide'
  },
  {
    id: 4,
    name: 'Amazon',
    url: 'https://api.amazon.com',
    apiKey: 'amazon_****_****',
    status: 'pending',
    productsCount: 0,
    lastSync: 'Jamais',
    description: 'Marketplace Amazon (en configuration)'
  }
]

export default function SuppliersPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    url: '',
    apiKey: '',
    description: ''
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <XCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50'
      case 'disconnected':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const testConnection = (supplierId: number) => {
    // Simulate API test
    alert(`Test de connexion pour le fournisseur ${supplierId}...`)
    setTimeout(() => {
      alert('Connexion réussie ! ✅')
    }, 1000)
  }

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.url && newSupplier.apiKey) {
      alert(`Fournisseur "${newSupplier.name}" ajouté avec succès !`)
      setNewSupplier({ name: '', url: '', apiKey: '', description: '' })
      setShowAddForm(false)
    } else {
      alert('Veuillez remplir tous les champs obligatoires')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-600 mt-2">Gérez vos connexions aux plateformes de dropshipping</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Fournisseur
        </Button>
      </div>

      {/* Add Supplier Form */}
      {showAddForm && (
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle>Ajouter un Nouveau Fournisseur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Fournisseur
                </label>
                <Input
                  placeholder="Ex: Temu, AliExpress..."
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'API
                </label>
                <Input
                  placeholder="https://api.example.com"
                  value={newSupplier.url}
                  onChange={(e) => setNewSupplier({...newSupplier, url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API
                </label>
                <Input
                  placeholder="Votre clé API..."
                  value={newSupplier.apiKey}
                  onChange={(e) => setNewSupplier({...newSupplier, apiKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  placeholder="Description du fournisseur..."
                  value={newSupplier.description}
                  onChange={(e) => setNewSupplier({...newSupplier, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
              <Button className="kamri-button" onClick={handleAddSupplier}>
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="kamri-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(supplier.status)}`}>
                      {getStatusIcon(supplier.status)}
                      <span className="capitalize">{supplier.status}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-900">{supplier.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Produits</p>
                    <p className="text-lg font-semibold text-gray-900">{supplier.productsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière sync</p>
                    <p className="text-sm text-gray-900">{supplier.lastSync}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => testConnection(supplier.id)}
                    >
                      <TestTube className="w-3 h-3 mr-1" />
                      Tester
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card className="kamri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-primary-500" />
            <span>Documentation API</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pour connecter de nouveaux fournisseurs, vous devez obtenir leurs clés API 
              et configurer les endpoints appropriés.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Temu API</h4>
                <p className="text-sm text-blue-700">
                  Documentation officielle Temu pour l'intégration des produits
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                  Voir la documentation →
                </Button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">AliExpress API</h4>
                <p className="text-sm text-green-700">
                  API AliExpress pour l'import automatique des produits
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-green-600">
                  Voir la documentation →
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
