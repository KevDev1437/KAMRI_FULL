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
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistCount = wishlistItems.length;

  const refreshWishlist = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getWishlist(userId);
      if (response.data) {
        setWishlistItems(Array.isArray(response.data) ? response.data : []);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!userId) return;
    
    try {
      await apiClient.addToWishlist(userId, productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!userId) return;
    
    try {
      await apiClient.removeFromWishlist(userId, productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!userId) return;
    
    try {
      await apiClient.clearWishlist(userId);
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
      refreshWishlist();
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
