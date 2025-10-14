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
import { useState } from 'react'

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
          onClick={() => alert('Ajouter une catégorie - Fonctionnalité à venir')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Catégorie
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
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
                    <p className="text-sm text-gray-500">{category.productCount} produits</p>
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
                {category.externalMappings.map((mapping, index) => (
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
                ))}
              </div>

              {/* Actions */}
              {selectedCategory === category.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Link className="w-3 h-3 mr-1" />
                      Mapper
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
    </div>
  )
}
