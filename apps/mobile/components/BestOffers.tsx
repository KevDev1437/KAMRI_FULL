import { Ionicons } from '@expo/vector-icons';
import { formatDiscountPercentage, getBadgeConfig } from '@kamri/lib';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
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
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Utilisation des couleurs d'étiquettes cohérentes pour "promo"
  const badgeConfig = getBadgeConfig('promo');
  
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}$`;
  };
  
  // Calcul du pourcentage de réduction basé sur le discount
  const discountPercentage = product.discount || 0;

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
        console.log('❤️ [BEST-OFFERS] Retiré des favoris:', product.name);
      } else {
        await apiClient.addToWishlist(product.id);
        setIsFavorite(true);
        console.log('❤️ [BEST-OFFERS] Ajouté aux favoris:', product.name);
      }
    } catch (error) {
      console.error('❌ [BEST-OFFERS] Erreur favoris:', error);
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
      console.log('🛒 [BEST-OFFERS] Ajouté au panier:', product.name);
      Alert.alert('Succès', 'Produit ajouté au panier !');
    } catch (error) {
      console.error('❌ [BEST-OFFERS] Erreur panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    } finally {
      setIsAddingToCart(false);
    }
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
            <Ionicons name="image-outline" size={32} color="#81C784" />
          </ThemedView>
        )}
        
        {/* Badge Promo */}
        <View style={[styles.badge, { backgroundColor: badgeConfig.backgroundColor }]}>
          <ThemedText style={[styles.badgeText, { color: badgeConfig.color }]}>
            {discountPercentage > 0 
              ? formatDiscountPercentage(discountPercentage)
              : `${badgeConfig.icon} ${badgeConfig.text}`
            }
          </ThemedText>
        </View>

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
        <ThemedText style={styles.productName} numberOfLines={1}>
          {product.name}
        </ThemedText>
        
        <View style={styles.priceContainer}>
          <ThemedText style={styles.productPrice}>{formatPrice(product.price)}</ThemedText>
          {product.originalPrice && (
            <ThemedText style={styles.originalPrice}>{formatPrice(product.originalPrice)}</ThemedText>
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
  );
}

export default function BestOffers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBestOffers = async () => {
      try {
        console.log('💰 [BESTOFFERS] Début du chargement des meilleures offres');
        setLoading(true);
        const response = await apiClient.getProducts();
        console.log('💰 [BESTOFFERS] Réponse API:', response);
        
        if (response.data) {
          console.log('💰 [BESTOFFERS] Produits reçus:', response.data.length);
          
          // Debug: Afficher les détails des produits
          console.log('💰 [BESTOFFERS] Détails des produits:', response.data.map(p => ({
            name: p.name,
            discount: p.discount,
            hasDiscount: p.discount && p.discount > 0
          })));
          
          // Filtrer les produits avec des réductions
          const productsWithDiscount = response.data.filter(product => 
            product.discount && product.discount > 0
          );
          console.log('💰 [BESTOFFERS] Produits avec réduction:', productsWithDiscount.length);
          
          // Si pas de produits avec réduction, prendre les 6 premiers produits
          let bestOffers;
          if (productsWithDiscount.length === 0) {
            console.log('💰 [BESTOFFERS] Aucun produit avec réduction, affichage des 6 premiers produits');
            bestOffers = response.data.slice(0, 6);
          } else {
            bestOffers = productsWithDiscount.slice(0, 6);
          }
          
          console.log('💰 [BESTOFFERS] Meilleures offres finales:', bestOffers.length);
          setProducts(bestOffers);
        } else {
          console.log('💰 [BESTOFFERS] Pas de données dans la réponse');
        }
      } catch (error) {
        console.error('❌ [BESTOFFERS] Erreur lors du chargement des meilleures offres:', error);
      } finally {
        setLoading(false);
        console.log('💰 [BESTOFFERS] Chargement terminé');
      }
    };

    loadBestOffers();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.sectionTitle}>Meilleures Offres</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Chargement...
          </ThemedText>
        </View>
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <ThemedText style={styles.sectionTitle}>Meilleures Offres</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Découvrez nos promotions exclusives
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
    marginBottom: 33,
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
    color: '#81C784',
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
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FF7043',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
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
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
