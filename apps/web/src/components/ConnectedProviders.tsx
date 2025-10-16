'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';

interface ConnectedProvidersProps {
  children: React.ReactNode;
}

export default function ConnectedProviders({ children }: ConnectedProvidersProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userId = user?.id || null;

  console.log('🔗 [ConnectedProviders] user:', user);
  console.log('🔗 [ConnectedProviders] isAuthenticated:', isAuthenticated);
  console.log('🔗 [ConnectedProviders] isLoading:', isLoading);
  console.log('🔗 [ConnectedProviders] userId:', userId);

  // Attendre que l'auth soit initialisée
  if (isLoading) {
    console.log('⏳ [ConnectedProviders] Auth en cours de chargement...');
    return (
      <CartProvider userId={null}>
        <WishlistProvider userId={null}>
          {children}
        </WishlistProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider userId={userId}>
      <WishlistProvider userId={userId}>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
