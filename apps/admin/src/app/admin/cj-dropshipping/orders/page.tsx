'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJOrder } from '@/types/cj.types';
import { useState } from 'react';

export default function CJOrdersPage() {
  const {
    loading,
    error,
    getOrderStatus,
    syncOrderStatuses,
    getTracking,
  } = useCJDropshipping();

  const [orders, setOrders] = useState<CJOrder[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      const result = await syncOrderStatuses();
      alert(`✅ Synchronisation terminée: ${result.synced} commandes mises à jour, ${result.errors} erreurs`);
    } catch (err) {
      alert('❌ Erreur lors de la synchronisation des commandes');
    } finally {
      setSyncing(false);
    }
  };

  const handleTrackPackage = async () => {
    if (!trackingNumber.trim()) {
      alert('Veuillez entrer un numéro de suivi');
      return;
    }

    setLoadingTracking(true);
    try {
      const info = await getTracking(trackingNumber);
      setTrackingInfo(info);
    } catch (err) {
      alert('❌ Erreur lors de la récupération du suivi');
    } finally {
      setLoadingTracking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'Créée';
      case 'paid':
        return 'Payée';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Commandes CJ Dropshipping
        </h1>
        <p className="text-gray-600">
          Gérez et suivez vos commandes CJ Dropshipping
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Synchronisation</h2>
          <p className="text-gray-600 mb-4">
            Synchronisez les statuts de vos commandes CJ avec KAMRI
          </p>
          <Button
            onClick={handleSyncOrders}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? 'Synchronisation...' : 'Synchroniser les commandes'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Suivi de colis</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Numéro de suivi"
              className="flex-1"
            />
            <Button
              onClick={handleTrackPackage}
              disabled={loadingTracking || !trackingNumber.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loadingTracking ? 'Recherche...' : 'Suivre'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Informations de suivi */}
      {trackingInfo && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informations de suivi</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(trackingInfo, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Liste des commandes */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Commandes récentes</h2>
          <div className="text-sm text-gray-600">
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Commande #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {order.orderId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium">{order.shippingAddress?.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pays</p>
                    <p className="font-medium">{order.shippingAddress?.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Produits</p>
                    <p className="font-medium">{order.products?.length || 0} article(s)</p>
                  </div>
                </div>

                {order.trackNumber && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Numéro de suivi</p>
                    <p className="font-mono text-sm">{order.trackNumber}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Créée: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <span>
                    Mise à jour: {new Date(order.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
              <p>Les commandes CJ Dropshipping apparaîtront ici une fois créées</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

