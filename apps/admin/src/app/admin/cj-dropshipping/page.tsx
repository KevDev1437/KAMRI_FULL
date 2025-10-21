'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJConfig, CJStats } from '@/types/cj.types';
import { useEffect, useState } from 'react';

export default function CJDropshippingPage() {
  const {
    loading,
    error,
    getConfig,
    getStats,
    testConnection,
  } = useCJDropshipping();

  const [config, setConfig] = useState<CJConfig | null>(null);
  const [stats, setStats] = useState<CJStats | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configData, statsData] = await Promise.all([
        getConfig(),
        getStats(),
      ]);
      setConfig(configData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testConnection();
      if (success) {
        alert('✅ Connexion CJ Dropshipping réussie !');
        await loadData(); // Recharger les données
      } else {
        alert('❌ Connexion CJ Dropshipping échouée');
      }
    } catch (err) {
      alert('❌ Erreur lors du test de connexion');
    } finally {
      setTesting(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CJ Dropshipping
        </h1>
        <p className="text-gray-600">
          Gestion de l'intégration CJ Dropshipping avec KAMRI
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statut de connexion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Statut</p>
              <p className={`text-2xl font-bold ${
                config?.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {config?.connected ? 'Connecté' : 'Déconnecté'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              config?.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Tier</p>
            <p className="text-2xl font-bold text-blue-600 capitalize">
              {config?.tier || 'Non configuré'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Produits</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats?.products.total || 0}
            </p>
            <p className="text-xs text-gray-500">
              {stats?.products.synced || 0} synchronisés
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Commandes</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats?.orders.total || 0}
            </p>
            <p className="text-xs text-gray-500">
              {stats?.orders.active || 0} actives
            </p>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{config?.email || 'Non configuré'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">API Key</p>
              <p className="font-medium">
                {config?.apiKey ? '***' + config.apiKey.slice(-4) : 'Non configuré'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTestConnection}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/cj-dropshipping/config'}
                variant="outline"
              >
                Configurer
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/admin/cj-dropshipping/products'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Rechercher des produits
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/cj-dropshipping/orders'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Gérer les commandes
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/cj-dropshipping/webhooks'}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Configuration webhooks
            </Button>
          </div>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      {stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiques détaillées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Produits</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total importés</span>
                  <span className="font-medium">{stats.products.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Synchronisés</span>
                  <span className="font-medium text-green-600">{stats.products.synced}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Commandes</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium">{stats.orders.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actives</span>
                  <span className="font-medium text-blue-600">{stats.orders.active}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Webhooks</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total reçus</span>
                  <span className="font-medium">{stats.webhooks.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Traités</span>
                  <span className="font-medium text-green-600">{stats.webhooks.processed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Récents (24h)</span>
                  <span className="font-medium text-orange-600">{stats.webhooks.recent}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

