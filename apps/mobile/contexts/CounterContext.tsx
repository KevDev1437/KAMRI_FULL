import React, { createContext, useCallback, useContext, useState } from 'react';

interface CounterContextType {
  favoritesCount: number;
  cartCount: number;
  setFavoritesCount: (count: number) => void;
  setCartCount: (count: number) => void;
  incrementFavorites: () => void;
  decrementFavorites: () => void;
  incrementCart: (quantity?: number) => void;
  decrementCart: (quantity?: number) => void;
  refreshCounters: () => void;
  syncFromAPI: (favorites: number, cart: number) => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const useCounters = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounters must be used within a CounterProvider');
  }
  return context;
};

interface CounterProviderProps {
  children: React.ReactNode;
}

export const CounterProvider: React.FC<CounterProviderProps> = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const incrementFavorites = useCallback(() => {
    setFavoritesCount(prev => prev + 1);
  }, []);

  const decrementFavorites = useCallback(() => {
    setFavoritesCount(prev => Math.max(0, prev - 1));
  }, []);

  const incrementCart = useCallback((quantity: number = 1) => {
    setCartCount(prev => prev + quantity);
  }, []);

  const decrementCart = useCallback((quantity: number = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  }, []);

  const refreshCounters = useCallback(() => {
    // Cette fonction sera implémentée pour recharger les compteurs depuis l'API
    console.log('🔄 [COUNTER-CONTEXT] Refresh des compteurs demandé');
  }, []);

  const syncFromAPI = useCallback((favorites: number, cart: number) => {
    console.log('🔄 [COUNTER-CONTEXT] Synchronisation depuis API:', { favorites, cart });
    setFavoritesCount(favorites);
    setCartCount(cart);
  }, []);

  const value: CounterContextType = {
    favoritesCount,
    cartCount,
    setFavoritesCount,
    setCartCount,
    incrementFavorites,
    decrementFavorites,
    incrementCart,
    decrementCart,
    refreshCounters,
    syncFromAPI,
  };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
};
