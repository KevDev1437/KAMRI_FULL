'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Edit,
    Filter,
    Mail,
    Plus,
    Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    Users,
    UserX
} from 'lucide-react'
import { useState } from 'react'

// Mock data
const users = [
  {
    id: 1,
    name: 'Admin KAMRI',
    email: 'admin@kamri.com',
    role: 'admin',
    status: 'active',
    lastLogin: 'Il y a 2 heures',
    createdAt: '2024-01-01',
    avatar: null
  },
  {
    id: 2,
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    role: 'user',
    status: 'active',
    lastLogin: 'Il y a 1 jour',
    createdAt: '2024-01-10',
    avatar: null
  },
  {
    id: 3,
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    role: 'user',
    status: 'suspended',
    lastLogin: 'Il y a 3 jours',
    createdAt: '2024-01-08',
    avatar: null
  },
  {
    id: 4,
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    role: 'user',
    status: 'active',
    lastLogin: 'Il y a 2 heures',
    createdAt: '2024-01-12',
    avatar: null
  },
  {
    id: 5,
    name: 'Sophie Bernard',
    email: 'sophie.bernard@email.com',
    role: 'user',
    status: 'inactive',
    lastLogin: 'Il y a 1 semaine',
    createdAt: '2024-01-05',
    avatar: null
  }
]

const roles = ['Tous', 'admin', 'user']
const statuses = ['Tous', 'active', 'suspended', 'inactive']

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('Tous')
  const [selectedStatus, setSelectedStatus] = useState('Tous')
  const [showFilters, setShowFilters] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="w-4 h-4 text-green-500" />
      case 'suspended':
        return <UserX className="w-4 h-4 text-yellow-500" />
      case 'inactive':
        return <User className="w-4 h-4 text-gray-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'suspended':
        return 'text-yellow-600 bg-yellow-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'suspended':
        return 'Suspendu'
      case 'inactive':
        return 'Inactif'
      default:
        return status
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      case 'user':
        return <User className="w-4 h-4 text-gray-500" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-blue-600 bg-blue-50'
      case 'user':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const toggleUserStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    alert(`Utilisateur ${userId} ${newStatus === 'active' ? 'activé' : 'suspendu'}`)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'Tous' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'Tous' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les utilisateurs et administrateurs</p>
        </div>
        <Button 
          className="kamri-button"
          onClick={() => alert('Ajouter un utilisateur - Fonctionnalité à venir')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Utilisateur
        </Button>
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
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'Tous' ? 'Tous les rôles' : role === 'admin' ? 'Administrateurs' : 'Utilisateurs'}
                </option>
              ))}
            </select>

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

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="kamri-card">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Dernière connexion:</span>
                      <span className="text-sm text-gray-900">{user.lastLogin}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span>{getStatusText(user.status)}</span>
                    </div>
                    <span className="text-xs text-gray-500">Créé le {user.createdAt}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => alert(`Modifier l'utilisateur ${user.name}`)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {user.status === 'active' ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Suspendre
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => alert(`Supprimer l'utilisateur ${user.name}`)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="kamri-card">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                <p className="text-lg font-semibold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspendus</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administrateurs</p>
                <p className="text-lg font-semibold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kamri-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
