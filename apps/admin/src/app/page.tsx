'use client'

import { AlertTriangle, BarChart3, CheckCircle, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CategorizationStats {
  totalProducts: number
  manuallyMapped: number
  autoMapped: number
  uncategorized: number
  averageConfidence: number
  autoMappingRate: number
  manualMappingRate: number
}

interface LowConfidenceProduct {
  id: string
  name: string
  currentCategory: string
  originalCategory: string | null
  supplierCategory: string | null
  confidence: number | null
  supplier: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<CategorizationStats | null>(null)
  const [lowConfidenceProducts, setLowConfidenceProducts] = useState<LowConfidenceProduct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchLowConfidenceProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories/low-confidence?threshold=0.5')
      const data = await response.json()
      setLowConfidenceProducts(data)
    } catch (error) {
      console.error('Erreur lors du chargement des produits à faible confiance:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchLowConfidenceProducts()])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KAMRI Admin</h1>
              <p className="text-gray-600">Gestion des catégories de produits</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Auto-catégorisés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.autoMapped}</p>
                  <p className="text-sm text-gray-500">{stats.autoMappingRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Settings className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Corrigés manuellement</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.manuallyMapped}</p>
                  <p className="text-sm text-gray-500">{stats.manualMappingRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-danger-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Non catégorisés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uncategorized}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low Confidence Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Produits à faible confiance de catégorisation
            </h2>
            <span className="badge badge-warning">
              {lowConfidenceProducts.length} produits
            </span>
          </div>

          {lowConfidenceProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
              <p className="text-gray-600">Aucun produit à faible confiance trouvé !</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie actuelle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie originale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confiance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowConfidenceProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-success">
                          {product.currentCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.originalCategory || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.confidence ? (
                          <span className={`badge ${
                            product.confidence > 0.7 ? 'badge-success' :
                            product.confidence > 0.4 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {(product.confidence * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="badge badge-danger">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="btn btn-primary text-xs">
                          Corriger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
