'use client'

import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
    Activity,
    ArrowUpRight,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalProducts: number
  promoProducts: number
  totalOrders: number
  connectedSuppliers: number
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
}

interface TopCategory {
  name: string
  productCount: number
}

interface RecentActivity {
  recentOrders: any[]
  recentProducts: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topCategories, setTopCategories] = useState<TopCategory[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    } else {
      setShowLogin(true)
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les statistiques
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Charger les top catégories
      const categoriesResponse = await apiClient.getTopCategories()
      if (categoriesResponse.data) {
        setTopCategories(categoriesResponse.data)
      }

      // Charger l'activité récente
      const activityResponse = await apiClient.getDashboardActivity()
      if (activityResponse.data) {
        setRecentActivity(activityResponse.data)
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
                Veuillez vous connecter pour accéder au dashboard
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
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  // Données formatées pour l'affichage
  const displayStats = [
    {
      title: 'Produits Totaux',
      value: stats?.totalProducts?.toString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
    },
    {
      title: 'Produits en Promotion',
      value: stats?.promoProducts?.toString() || '0',
      change: '+5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Commandes',
      value: stats?.totalOrders?.toString() || '0',
      change: '+23%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Fournisseurs Connectés',
      value: stats?.connectedSuppliers?.toString() || '0',
      change: '+2',
      changeType: 'positive' as const,
      icon: Truck,
    },
  ]

  // Formatage de l'activité récente
  const displayActivity = [
    ...(recentActivity?.recentProducts?.slice(0, 2).map((product, index) => ({
      id: `product-${index}`,
      action: 'Nouveau produit ajouté',
      description: `${product.name} - ${product.supplier?.name || 'Import'}`,
      time: new Date(product.createdAt).toLocaleDateString(),
      type: 'product'
    })) || []),
    ...(recentActivity?.recentOrders?.slice(0, 2).map((order, index) => ({
      id: `order-${index}`,
      action: 'Commande reçue',
      description: `Commande #${order.id} - ${order.items?.length || 0} produits`,
      time: new Date(order.createdAt).toLocaleDateString(),
      type: 'order'
    })) || [])
  ]
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre plateforme KAMRI</p>
        {user && (
          <p className="text-sm text-gray-500">Connecté en tant que {user.name}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat) => (
          <Card key={stat.title} className="kamri-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stat.change} par rapport au mois dernier
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle>Ventes Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Graphique des ventes</p>
                <p className="text-sm text-gray-400">Recharts sera intégré ici</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'product' ? 'bg-primary-500' :
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'supplier' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="kamri-card">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="kamri-button h-auto p-4 flex flex-col items-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Importer Produits</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Truck className="h-6 w-6" />
              <span>Ajouter Fournisseur</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Gérer Utilisateurs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
