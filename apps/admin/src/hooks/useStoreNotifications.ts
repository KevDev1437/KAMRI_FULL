'use client';

import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export interface StoreNotification {
  storeId: string;
  storeName: string;
  availableProductsCount: number;
}

export interface NotificationSummary {
  total: number;
  stores: StoreNotification[];
}

/**
 * Hook pour récupérer les notifications de produits disponibles à importer
 * Rafraîchit automatiquement toutes les 30 secondes
 */
export function useStoreNotifications() {
  const [notifications, setNotifications] = useState<NotificationSummary>({
    total: 0,
    stores: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      
      // Récupérer la liste des magasins
      const storesResponse = await apiClient('/stores') as any;
      const stores = storesResponse.data || [];

      // Pour chaque magasin, compter les produits disponibles
      const storeNotifications: StoreNotification[] = await Promise.all(
        stores.map(async (store: any) => {
          try {
            const productsResponse = await apiClient(`/stores/${store.id}/products`) as any;
            const products = productsResponse.data || [];
            
            // Compter les produits avec status "available"
            const availableCount = products.filter(
              (p: any) => p.status === 'available'
            ).length;

            return {
              storeId: store.id,
              storeName: store.name || 'Magasin sans nom',
              availableProductsCount: availableCount,
            };
          } catch (err) {
            console.warn(`Erreur lors de la récupération des produits du magasin ${store.id}:`, err);
            return {
              storeId: store.id,
              storeName: store.name || 'Magasin sans nom',
              availableProductsCount: 0,
            };
          }
        })
      );

      // Filtrer uniquement les magasins avec produits disponibles
      const storesWithProducts = storeNotifications.filter(s => s.availableProductsCount > 0);
      const totalCount = storesWithProducts.reduce((sum, s) => sum + s.availableProductsCount, 0);

      setNotifications({
        total: totalCount,
        stores: storesWithProducts,
      });
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError('Impossible de charger les notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);

    // Écouter l'événement de rafraîchissement manuel
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshStoreNotifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshStoreNotifications', handleRefresh);
    };
  }, []);

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
  };
}
