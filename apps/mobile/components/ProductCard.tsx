import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  rating: number;
  reviews: number;
  badge: string | null;
  brand: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'tendance':
        return '#FF7043';
      case 'nouveau':
        return '#4CAF50';
      case 'promo':
        return '#FF5722';
      default:
        return '';
    }
  };

  const getBadgeText = (badge: string | null) => {
    switch (badge) {
      case 'tendance':
        return '🔥 Tendance';
      case 'nouveau':
        return '🆕 Nouveau';
      case 'promo':
        return '💸 Promo';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <ThemedView style={styles.productCardContent}>
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        <ThemedView style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#81C784" />
        </ThemedView>
        
        {/* Badge */}
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: getBadgeColor(product.badge) }]}>
            <ThemedText style={styles.badgeText}>{getBadgeText(product.badge)}</ThemedText>
          </View>
        )}

        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#81C784" />
        </TouchableOpacity>
      </View>
      
      {/* Product info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.brandText}>{product.brand}</ThemedText>
        
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                size={12}
                color={i < Math.floor(product.rating) ? '#FFD700' : '#E0E0E0'}
              />
            ))}
          </View>
          <ThemedText style={styles.reviewsText}>({product.reviews})</ThemedText>
        </View>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>{product.price.toFixed(2)}€</ThemedText>
          {product.originalPrice && (
            <ThemedText style={styles.originalPrice}>{product.originalPrice.toFixed(2)}€</ThemedText>
          )}
        </View>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Ajouter</ThemedText>
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
});
