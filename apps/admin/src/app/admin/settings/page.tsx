'use client'

import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
    DollarSign,
    Globe,
    Moon,
    Palette,
    RefreshCw,
    Save,
    Settings,
    Sun
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Settings {
  id?: string
  theme: string
  currency: string
  language: string
  accentColor: string
  companyName: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  apiRateLimit: number
  autoSync: boolean
  notifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    currency: 'EUR',
    language: 'fr',
    accentColor: '#4CAF50',
    companyName: 'KAMRI',
    companyEmail: 'admin@kamri.com',
    companyPhone: '+33 1 23 45 67 89',
    companyAddress: '123 Rue de la Paix, 75001 Paris',
    apiRateLimit: 1000,
    autoSync: true,
    notifications: true,
    emailNotifications: true,
    smsNotifications: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings()
    } else {
      setShowLogin(true)
    }
  }, [isAuthenticated])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSettings()
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await apiClient.updateSettings(settings)
      if (response.data) {
        alert('Paramètres sauvegardés avec succès !')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
        theme: 'light',
        currency: 'EUR',
        language: 'fr',
        accentColor: '#4CAF50',
        companyName: 'KAMRI',
        companyEmail: 'admin@kamri.com',
        companyPhone: '+33 1 23 45 67 89',
        companyAddress: '123 Rue de la Paix, 75001 Paris',
        apiRateLimit: 1000,
        autoSync: true,
        notifications: true,
        emailNotifications: true,
        smsNotifications: false
      })
      alert('Paramètres réinitialisés !')
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
                Veuillez vous connecter pour accéder aux paramètres
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
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">Configurez votre plateforme KAMRI</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button className="kamri-button" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-primary-500" />
              <span>Apparence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thème
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSettings({...settings, theme: 'light'})}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    settings.theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Clair</span>
                </button>
                <button
                  onClick={() => setSettings({...settings, theme: 'dark'})}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    settings.theme === 'dark' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Sombre</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur d'accent
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                  className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary-500" />
              <span>Localisation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre Sterling (£)</option>
                <option value="CAD">Dollar Canadien (C$)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary-500" />
              <span>Informations de l'entreprise</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                placeholder="KAMRI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                value={settings.companyEmail}
                onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                placeholder="admin@kamri.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <Input
                value={settings.companyPhone}
                onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="kamri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <span>Configuration API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de taux API (requêtes/heure)
              </label>
              <Input
                value={settings.apiRateLimit}
                onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value) || 1000})}
                type="number"
                placeholder="1000"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Synchronisation automatique</label>
                  <p className="text-xs text-gray-500">Synchroniser automatiquement avec les fournisseurs</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => setSettings({...settings, autoSync: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications</label>
                  <p className="text-xs text-gray-500">Recevoir des notifications système</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications email</label>
                  <p className="text-xs text-gray-500">Recevoir des notifications par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications SMS</label>
                  <p className="text-xs text-gray-500">Recevoir des notifications par SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="kamri-card">
        <CardHeader>
          <CardTitle>Aperçu des paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Thème</h4>
              <p className="text-sm text-gray-600">
                {settings.theme === 'dark' ? 'Mode sombre' : 'Mode clair'} avec couleur d'accent {settings.accentColor}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Localisation</h4>
              <p className="text-sm text-gray-600">
                Langue: {settings.language === 'fr' ? 'Français' : 'English'} • 
                Devise: {settings.currency}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
              <p className="text-sm text-gray-600">
                {settings.notifications ? 'Activées' : 'Désactivées'} • 
                {settings.autoSync ? 'Sync auto' : 'Sync manuelle'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
