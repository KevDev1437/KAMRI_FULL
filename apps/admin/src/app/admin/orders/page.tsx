'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    CheckCircle,
    Clock,
    Eye,
    Filter,
    Package,
    Search,
    ShoppingCart,
    Truck,
    XCircle
} from 'lucide-react'
import { useState } from 'react'

// Mock data
const orders = [
  {
    id: 'ORD-001',
    customer: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    total: 299.97,
    status: 'processing',
    suppliers: ['Temu', 'AliExpress'],
    products: [
      { name: 'iPhone 15 Pro', supplier: 'Temu', quantity: 1, price: 999.99 },
      { name: 'Jean Slim Fit', supplier: 'AliExpress', quantity: 2, price: 59.99 }
    ],
    date: '2024-01-15',
    shippingAddress: '123 Rue de la Paix, Paris'
  },
  {
    id: 'ORD-002',
    customer: 'Marie Martin',
    email: 'marie.martin@email.com',
    total: 89.99,
    status: 'shipped',
    suppliers: ['Shein'],
    products: [
      { name: 'Sac à Main Cuir', supplier: 'Shein', quantity: 1, price: 89.99 }
    ],
    date: '2024-01-14',
    shippingAddress: '456 Avenue des Champs, Lyon'
  },
  {
    id: 'ORD-003',
    customer: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    total: 1299.99,
    status: 'delivered',
    suppliers: ['Temu'],
    products: [
      { name: 'Laptop Gaming', supplier: 'Temu', quantity: 1, price: 1299.99 }
    ],
    date: '2024-01-13',
    shippingAddress: '789 Boulevard Saint-Germain, Marseille'
  },
  {
    id: 'ORD-004',
    customer: 'Sophie Bernard',
    email: 'sophie.bernard@email.com',
    total: 179.98,
    status: 'cancelled',
    suppliers: ['AliExpress', 'Shein'],
    products: [
      { name: 'Parfum Élégant', supplier: 'AliExpress', quantity: 1, price: 79.99 },
      { name: 'Crème Hydratante', supplier: 'Shein', quantity: 1, price: 99.99 }
    ],
    date: '2024-01-12',
    shippingAddress: '321 Rue de Rivoli, Toulouse'
  }
]

const statuses = ['Tous', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Tous')
  const [showFilters, setShowFilters] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-600 bg-yellow-50'
      case 'shipped':
        return 'text-blue-600 bg-blue-50'
      case 'delivered':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'En cours'
      case 'shipped':
        return 'Expédié'
      case 'delivered':
        return 'Livré'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'Tous' || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600 mt-2">Suivez et gérez les commandes de vos clients</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
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
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'Tous' ? 'Tous les statuts' : getStatusText(status)}
                </option>
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="kamri-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.customer} • {order.email}</p>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-semibold text-gray-900">{order.total}€</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-sm text-gray-900">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fournisseurs</p>
                      <p className="text-sm text-gray-900">{order.suppliers.length} fournisseur(s)</p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Produits</p>
                    <div className="space-y-2">
                      {order.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{product.name}</span>
                            <span className="text-xs text-gray-500">x{product.quantity}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{product.supplier}</span>
                            <span className="text-sm font-medium text-gray-900">{product.price}€</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suppliers */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Fournisseurs impliqués</p>
                    <div className="flex flex-wrap gap-2">
                      {order.suppliers.map((supplier, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          {supplier}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Adresse de livraison</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Truck className="w-3 h-3 mr-1" />
                    Suivre
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="kamri-card">
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expédiées</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Livrées</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Annulées</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
