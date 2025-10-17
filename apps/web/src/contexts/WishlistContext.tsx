'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category?: {
      name: string;
    };
    supplier?: {
      name: string;
    };
    images?: Array<{ url: string; alt?: string }>;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: React.ReactNode;
  userId: string;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children, userId }) => {
  console.log('🚀 [WishlistProvider] Initialisation avec userId:', userId);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistCount = wishlistItems.length;
  console.log('📈 [WishlistContext] wishlistCount mis à jour:', wishlistCount, 'items:', wishlistItems.length);
  console.log('📋 [WishlistContext] wishlistItems:', wishlistItems);

  const refreshWishlist = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('🔄 [refreshWishlist] Appel API getWishlist...');
      const response = await apiClient.getWishlist();
      console.log('📡 [refreshWishlist] Réponse API:', response);
      if (response.data) {
        // Le backend retourne { data: wishlist, message: '...' }
        // Donc response.data contient { data: [...], message: '...' }
        const backendData = response.data.data || response.data;
        const items = Array.isArray(backendData) ? backendData : [];
        console.log('📦 [refreshWishlist] Items récupérés:', items.length, items);
        setWishlistItems(items);
        console.log('✅ [refreshWishlist] wishlistItems mis à jour avec:', items.length, 'items');
      } else {
        console.log('❌ [refreshWishlist] Pas de données dans la réponse');
        setWishlistItems([]);
        console.log('🔄 [refreshWishlist] wishlistItems vidé');
      }
    } catch (error) {
      console.error('❌ [refreshWishlist] Erreur lors du chargement des favoris:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    console.log('🎯 [WishlistContext] addToWishlist appelé', { userId, productId });
    if (!userId) {
      console.log('❌ [WishlistContext] Pas d\'userId');
      return;
    }
    
    try {
      console.log('📡 [WishlistContext] Appel API...');
      const response = await apiClient.addToWishlist(productId);
      console.log('📡 [WishlistContext] Réponse API:', response);
      
      if (response.data) {
        console.log('✅ [WishlistContext] Ajout réussi, refresh immédiat...');
        // Refresh immédiat puis après un délai pour s'assurer
        await refreshWishlist();
        setTimeout(async () => {
          console.log('🔄 [WishlistContext] Refresh après délai...');
          await refreshWishlist();
        }, 500);
      } else if (response.message === 'Produit déjà dans les favoris') {
        console.log('ℹ️ [WishlistContext] Produit déjà dans les favoris, refresh...');
        await refreshWishlist();
      } else {
        console.log('❌ [WishlistContext] Erreur d\'ajout:', response.error || response.message);
      }
    } catch (error) {
      console.error('❌ [WishlistContext] Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!userId) return;
    
    try {
      await apiClient.removeFromWishlist(productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!userId) return;
    
    try {
      await apiClient.clearWishlist();
      await refreshWishlist();
    } catch (error) {
      console.error('Erreur lors du vidage des favoris:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  useEffect(() => {
    if (userId) {
      console.log('🚀 [WishlistProvider] Initialisation avec userId:', userId);
      refreshWishlist();
    } else {
      console.log('ℹ️ [WishlistProvider] Aucun userId, wishlist vide');
      setWishlistItems([]);
    }
  }, [userId]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
