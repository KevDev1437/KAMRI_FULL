'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJWebhookLog } from '@/types/cj.types';
import { useEffect, useState } from 'react';

export default function CJWebhooksPage() {
  const {
    loading,
    error,
    configureWebhooks,
    getWebhookLogs,
  } = useCJDropshipping();

  const [webhookLogs, setWebhookLogs] = useState<CJWebhookLog[]>([]);
  const [configuring, setConfiguring] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);

  useEffect(() => {
    loadWebhookLogs();
  }, []);

  const loadWebhookLogs = async () => {
    try {
      const logs = await getWebhookLogs();
      setWebhookLogs(logs);
    } catch (err) {
      console.error('Erreur lors du chargement des logs:', err);
    }
  };

  const handleConfigureWebhooks = async (enable: boolean) => {
    setConfiguring(true);
    try {
      await configureWebhooks(enable);
      setWebhooksEnabled(enable);
      alert(enable ? '✅ Webhooks activés avec succès' : '✅ Webhooks désactivés avec succès');
    } catch (err) {
      alert('❌ Erreur lors de la configuration des webhooks');
    } finally {
      setConfiguring(false);
    }
  };

  const getWebhookTypeColor = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'bg-blue-100 text-blue-800';
      case 'STOCK':
        return 'bg-green-100 text-green-800';
      case 'ORDER':
        return 'bg-purple-100 text-purple-800';
      case 'LOGISTICS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWebhookTypeText = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'Produit';
      case 'STOCK':
        return 'Stock';
      case 'ORDER':
        return 'Commande';
      case 'LOGISTICS':
        return 'Logistique';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Webhooks CJ Dropshipping
        </h1>
        <p className="text-gray-600">
          Configurez et surveillez les webhooks CJ Dropshipping
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Configuration des webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Statut des webhooks</p>
                <p className={`text-sm ${
                  webhooksEnabled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {webhooksEnabled ? 'Activés' : 'Désactivés'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                webhooksEnabled ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleConfigureWebhooks(true)}
                disabled={configuring || webhooksEnabled}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {configuring ? 'Configuration...' : 'Activer les webhooks'}
              </Button>
              
              <Button
                onClick={() => handleConfigureWebhooks(false)}
                disabled={configuring || !webhooksEnabled}
                variant="outline"
                className="w-full"
              >
                Désactiver les webhooks
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">URL du webhook</h3>
              <div className="bg-gray-100 p-3 rounded-lg">
                <code className="text-sm">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cj-dropshipping/webhooks
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Types d'événements</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">PRODUCT - Changements de produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">STOCK - Mises à jour de stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-sm">ORDER - Changements de commandes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-sm">LOGISTICS - Informations de tracking</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistiques des webhooks */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {webhookLogs.length}
            </div>
            <div className="text-sm text-gray-600">Total reçus</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {webhookLogs.filter(log => log.processed).length}
            </div>
            <div className="text-sm text-gray-600">Traités</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {webhookLogs.filter(log => log.error).length}
            </div>
            <div className="text-sm text-gray-600">Erreurs</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {webhookLogs.filter(log => 
                new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-sm text-gray-600">Récents (24h)</div>
          </div>
        </div>
      </Card>

      {/* Logs des webhooks */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Logs des webhooks</h2>
          <Button
            onClick={loadWebhookLogs}
            variant="outline"
            size="sm"
          >
            Actualiser
          </Button>
        </div>

        {webhookLogs.length > 0 ? (
          <div className="space-y-4">
            {webhookLogs.slice(0, 50).map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWebhookTypeColor(log.type)}`}>
                      {getWebhookTypeText(log.type)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {log.messageId}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.processed ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-sm text-gray-600">
                      {log.processed ? 'Traité' : 'En attente'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(log.createdAt)}
                </div>

                {log.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <p className="text-sm text-red-800">
                      <strong>Erreur:</strong> {log.error}
                    </p>
                  </div>
                )}

                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Voir les détails du payload
                  </summary>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-lg font-medium mb-2">Aucun webhook reçu</h3>
              <p>Les webhooks CJ Dropshipping apparaîtront ici une fois activés</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

