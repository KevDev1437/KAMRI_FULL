'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Activity,
    ArrowUpRight,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users
} from 'lucide-react'

// Mock data
const stats = [
  {
    title: 'Produits Totaux',
    value: '1,247',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Package,
  },
  {
    title: 'Produits en Promotion',
    value: '89',
    change: '+5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
  {
    title: 'Commandes',
    value: '2,341',
    change: '+23%',
    changeType: 'positive' as const,
    icon: ShoppingCart,
  },
  {
    title: 'Fournisseurs Connectés',
    value: '12',
    change: '+2',
    changeType: 'positive' as const,
    icon: Truck,
  },
]

const recentActivity = [
  {
    id: 1,
    action: 'Nouveau produit ajouté',
    description: 'iPhone 15 Pro importé depuis Temu',
    time: 'Il y a 2 minutes',
    type: 'product'
  },
  {
    id: 2,
    action: 'Commande reçue',
    description: 'Commande #1234 - 3 produits',
    time: 'Il y a 15 minutes',
    type: 'order'
  },
  {
    id: 3,
    action: 'Fournisseur connecté',
    description: 'AliExpress API configurée',
    time: 'Il y a 1 heure',
    type: 'supplier'
  },
  {
    id: 4,
    action: 'Catégorie mise à jour',
    description: 'Mode → Vêtements Femme',
    time: 'Il y a 2 heures',
    type: 'category'
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre plateforme KAMRI</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
              {recentActivity.map((activity) => (
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
