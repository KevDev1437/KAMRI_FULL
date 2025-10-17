import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { apiClient, Product } from '../lib/api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const cardWidth = isTablet ? (width - 60) / 4 : (width - 60) / 2;

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <ThemedView style={[styles.productCard, { width: cardWidth }]}>
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
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </ThemedView>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      {/* Product info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={1}>
          {product.name}
        </ThemedText>
        <ThemedText style={styles.productPrice}>{formatPrice(product.price)}</ThemedText>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Ajouter</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🛍️ [PRODUCTGRID] Début du chargement des produits');
        setLoading(true);
        const response = await apiClient.getProducts();
        console.log('🛍️ [PRODUCTGRID] Réponse API:', response);
        
        if (response.data) {
          console.log('🛍️ [PRODUCTGRID] Produits reçus:', response.data.length);
          
          // Debug: Afficher les détails des images
          console.log('🛍️ [PRODUCTGRID] Détails des images:', response.data.slice(0, 3).map(p => ({
            name: p.name,
            image: p.image,
            hasImage: !!p.image
          })));
          
          // Limiter à 8 produits pour la page d'accueil
          const limitedProducts = response.data.slice(0, 8);
          console.log('🛍️ [PRODUCTGRID] Produits limités:', limitedProducts.length);
          setProducts(limitedProducts);
        } else {
          console.log('🛍️ [PRODUCTGRID] Pas de données dans la réponse');
        }
      } catch (error) {
        console.error('❌ [PRODUCTGRID] Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
        console.log('🛍️ [PRODUCTGRID] Chargement terminé');
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.sectionTitle}>Nos produits</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Chargement...
          </ThemedText>
        </View>
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.productCard, { width: cardWidth }]}>
              <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#E5E7EB" />
                </View>
              </View>
              <View style={styles.productInfo}>
                <View style={[styles.productName, { backgroundColor: '#E5E7EB', height: 20, marginBottom: 8 }]} />
                <View style={[styles.productPrice, { backgroundColor: '#E5E7EB', height: 18, marginBottom: 16 }]} />
                <View style={[styles.addButton, { backgroundColor: '#E5E7EB' }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.sectionTitle}>Nos produits</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Découvrez notre sélection exclusive
        </ThemedText>
      </View>
      
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: 'rgba(232, 245, 232, 0.3)',
    marginTop: 0,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 160,
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
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
