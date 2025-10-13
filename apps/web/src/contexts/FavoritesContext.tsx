'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (product: FavoriteItem) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorites = (product: FavoriteItem) => {
    setFavorites(prevFavorites => {
      const isAlreadyFavorite = prevFavorites.some(item => item.id === product.id);
      if (isAlreadyFavorite) {
        return prevFavorites; // Ne pas ajouter si déjà en favoris
      }
      return [...prevFavorites, product];
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
