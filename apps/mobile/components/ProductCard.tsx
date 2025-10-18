import { Ionicons } from '@expo/vector-icons';
import { calculateDiscountPercentage, formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useCounters } from '../contexts/CounterContext';
import { apiClient } from '../lib/api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  badge?: string | null;
  stock: number;
  supplier?: {
    name: string;
  };
  discount?: number;
  // Champs pour l'affichage (générés côté client)
  rating?: number;
  reviews?: number;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { incrementFavorites, decrementFavorites, incrementCart } = useCounters();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Utilisation des couleurs d'étiquettes cohérentes
  const badgeConfig = getBadgeConfig(product.badge as any);
  
  // Calcul du pourcentage de réduction pour les promos
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  // Gestion des favoris
  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.removeFromWishlist(product.id);
        setIsFavorite(false);
        decrementFavorites();
        console.log('❤️ [PRODUCT-CARD] Retiré des favoris:', product.name);
      } else {
        await apiClient.addToWishlist(product.id);
        setIsFavorite(true);
        incrementFavorites();
        console.log('❤️ [PRODUCT-CARD] Ajouté aux favoris:', product.name);
      }
    } catch (error) {
      console.error('❌ [PRODUCT-CARD] Erreur favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  // Gestion du panier
  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour ajouter au panier');
      return;
    }

    if (isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await apiClient.addToCart(product.id, 1);
      incrementCart(1);
      console.log('🛒 [PRODUCT-CARD] Ajouté au panier:', product.name);
      Alert.alert('Succès', 'Produit ajouté au panier !');
    } catch (error) {
      console.error('❌ [PRODUCT-CARD] Erreur panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <ThemedView style={styles.productCardContent}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#81C784" />
          </ThemedView>
        )}
        
        {/* Badge */}
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: badgeConfig.backgroundColor }]}>
            <ThemedText style={[styles.badgeText, { color: badgeConfig.color }]}>
              {product.badge === 'promo' && discountPercentage > 0 
                ? formatDiscountPercentage(discountPercentage)
                : `${badgeConfig.icon} ${badgeConfig.text}`
              }
            </ThemedText>
          </View>
        )}

        {/* Favorite button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite ? "#E91E63" : "#81C784"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Product info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.brandText}>{product.supplier?.name || product.brand || 'KAMRI'}</ThemedText>
        
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(product.rating || 4.5) ? 'star' : 'star-outline'}
                size={12}
                color={i < Math.floor(product.rating || 4.5) ? '#FFD700' : '#E0E0E0'}
              />
            ))}
          </View>
          <ThemedText style={styles.reviewsText}>({product.reviews || Math.floor(Math.random() * 200) + 50})</ThemedText>
        </View>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>{product.price.toFixed(2)}€</ThemedText>
          {product.originalPrice && (
            <ThemedText style={styles.originalPrice}>{product.originalPrice.toFixed(2)}€</ThemedText>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, isAddingToCart && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>
            {isAddingToCart ? 'Ajout...' : 'Ajouter'}
          </ThemedText>
        </TouchableOpacity>
      </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  productCardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#E8F5E8',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 11,
    color: '#81C784',
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 10,
    color: '#81C784',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
});
