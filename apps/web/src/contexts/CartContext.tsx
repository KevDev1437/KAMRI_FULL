'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    stock: number;
    category?: {
      name: string;
    };
    supplier?: {
      name: string;
    };
    images?: Array<{ url: string; alt?: string }>;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
  userId: string;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, userId }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const refreshCart = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getCart(userId);
      if (response.data) {
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!userId) return;
    
    try {
      await apiClient.addToCart(userId, productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!userId) return;
    
    try {
      await apiClient.removeFromCart(userId, itemId);
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!userId) return;
    
    try {
      // Pour l'instant, on supprime et on rajoute avec la nouvelle quantité
      // TODO: Créer un endpoint PATCH pour mettre à jour la quantité
      await apiClient.removeFromCart(userId, itemId);
      if (quantity > 0) {
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
          await apiClient.addToCart(userId, item.productId, quantity);
        }
      }
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!userId) return;
    
    try {
      await apiClient.clearCart(userId);
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('🚀 [CartProvider] Initialisation avec userId:', userId);
      refreshCart();
    } else {
      console.log('ℹ️ [CartProvider] Aucun userId, panier vide');
      setCartItems([]);
    }
  }, [userId]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
