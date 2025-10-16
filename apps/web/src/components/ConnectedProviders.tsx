'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';

interface ConnectedProvidersProps {
  children: React.ReactNode;
}

export default function ConnectedProviders({ children }: ConnectedProvidersProps) {
  const { user } = useAuth();
  const userId = user?.id || null;

  console.log('🔗 [ConnectedProviders] userId:', userId);

  return (
    <CartProvider userId={userId}>
      <WishlistProvider userId={userId}>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
