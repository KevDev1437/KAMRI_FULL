import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

// TODO: Remplacer par des appels API réels

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: any;
  images: any[];
  category: string;
  type: 'mode' | 'tech';
  rating: number;
  reviews: number;
  badge: string | null;
  brand: string;
  description: string;
  sizes: string[] | null;
  colors: string[];
  specifications: Record<string, string> | null;
  inStock: boolean;
  stockCount: number;
}

// Fonction pour récupérer un produit par ID depuis l'API
async function getProductById(id: string): Promise<Product | null> {
  try {
    // TODO: Remplacer par un appel API réel
    // Simulation d'appel API - pour l'instant retourne null
    await new Promise(resolve => setTimeout(resolve, 1000));
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error);
    return null;
  }
}

// Fonction pour récupérer des produits similaires depuis l'API
async function getSimilarProducts(category: string, currentId: string): Promise<Product[]> {
  try {
    // TODO: Remplacer par un appel API réel
    // Simulation d'appel API - pour l'instant retourne un tableau vide
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement des produits similaires:', error);
    return [];
  }
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const foundProduct = await getProductById(id);
        if (foundProduct) {
          setProduct(foundProduct);
          const similar = await getSimilarProducts(foundProduct.category, foundProduct.id);
          setSimilarProducts(similar);
          if (foundProduct.colors.length > 0) {
            setSelectedColor(foundProduct.colors[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#424242" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Chargement...</ThemedText>
            <View style={{ width: 24 }} />
          </ThemedView>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ThemedText>Chargement du produit...</ThemedText>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#424242" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Produit non trouvé</ThemedText>
            <View style={{ width: 24 }} />
          </ThemedView>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorIcon}>😞</ThemedText>
          <ThemedText style={styles.errorTitle}>Produit non trouvé</ThemedText>
          <ThemedText style={styles.errorSubtitle}>
            Le produit que vous recherchez n'existe pas.
          </ThemedText>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#424242" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{product.name}</ThemedText>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="#424242" />
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        <View style={styles.imageContainer}>
          <Image
            source={product.images[selectedImage]}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Badge */}
          {product.badge && (
            <View style={[
              styles.badge,
              { backgroundColor: product.badge === 'tendance' ? '#FF7043' : product.badge === 'nouveau' ? '#4CAF50' : '#FF5722' }
            ]}>
              <ThemedText style={styles.badgeText}>
                {product.badge === 'tendance' ? '🔥 Tendance' : 
                 product.badge === 'nouveau' ? '🆕 Nouveau' : '💸 Promo'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Miniatures */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsContainer}>
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImage === index && styles.selectedThumbnail
              ]}
              onPress={() => setSelectedImage(index)}
            >
              <Image source={image} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Informations produit */}
        <ThemedView style={styles.productInfo}>
          <ThemedText style={styles.brand}>{product.brand}</ThemedText>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color={i < Math.floor(product.rating) ? '#FFD700' : '#E0E0E0'}
                />
              ))}
            </View>
            <ThemedText style={styles.reviewsText}>({product.reviews} avis)</ThemedText>
          </View>

          {/* Prix */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>{product.price.toFixed(2)}€</ThemedText>
            {product.originalPrice && (
              <ThemedText style={styles.originalPrice}>{product.originalPrice.toFixed(2)}€</ThemedText>
            )}
          </View>

          {/* Description */}
          <ThemedText style={styles.description}>{product.description}</ThemedText>

          {/* Couleurs */}
          <View style={styles.optionSection}>
            <ThemedText style={styles.optionLabel}>Couleur</ThemedText>
            <View style={styles.optionsContainer}>
              {product.colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.optionButton,
                    selectedColor === color && styles.selectedOption
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    selectedColor === color && styles.selectedOptionText
                  ]}>
                    {color}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tailles (mode) */}
          {product.type === 'mode' && product.sizes && (
            <View style={styles.optionSection}>
              <ThemedText style={styles.optionLabel}>Taille</ThemedText>
              <View style={styles.optionsContainer}>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedSize === size && styles.selectedOption
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <ThemedText style={[
                      styles.optionText,
                      selectedSize === size && styles.selectedOptionText
                    ]}>
                      {size}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Spécifications (tech) */}
          {product.type === 'tech' && product.specifications && (
            <View style={styles.optionSection}>
              <ThemedText style={styles.optionLabel}>Spécifications techniques</ThemedText>
              <View style={styles.specificationsContainer}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specificationRow}>
                    <ThemedText style={styles.specificationKey}>{key}:</ThemedText>
                    <ThemedText style={styles.specificationValue}>{value}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quantité */}
          <View style={styles.quantitySection}>
            <ThemedText style={styles.optionLabel}>Quantité</ThemedText>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#424242" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#424242" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addToCartButton}>
              <Ionicons name="bag-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addToCartText}>Ajouter au panier</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyNowButton}>
              <ThemedText style={styles.buyNowText}>Acheter maintenant</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Stock */}
          <View style={styles.stockContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.stockText}>
              {product.inStock ? `${product.stockCount} en stock` : 'Rupture de stock'}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <ThemedText style={styles.similarTitle}>Produits similaires</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarContainer}>
              {similarProducts.map((similarProduct) => (
                <TouchableOpacity
                  key={similarProduct.id}
                  style={styles.similarProduct}
                  onPress={() => router.push(`/product/${similarProduct.id}`)}
                >
                  <Image source={similarProduct.image} style={styles.similarImage} resizeMode="cover" />
                  <ThemedText style={styles.similarName} numberOfLines={2}>
                    {similarProduct.name}
                  </ThemedText>
                  <ThemedText style={styles.similarPrice}>
                    {similarProduct.price.toFixed(2)}€
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#E8F5E8',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  brand: {
    fontSize: 12,
    color: '#81C784',
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 12,
    color: '#81C784',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 20,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  specificationsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specificationKey: {
    fontSize: 12,
    color: '#81C784',
    fontWeight: '500',
  },
  specificationValue: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    minWidth: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyNowText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  similarSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  similarContainer: {
    flexDirection: 'row',
  },
  similarProduct: {
    width: 120,
    marginRight: 12,
  },
  similarImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
  },
  similarName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginTop: 8,
    marginBottom: 4,
  },
  similarPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
