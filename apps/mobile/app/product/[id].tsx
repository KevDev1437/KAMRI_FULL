import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import UnifiedHeader from '../../components/UnifiedHeader';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { apiClient, Product } from '../../lib/api';

// Interface Product mise à jour pour correspondre à l'API
interface ProductDetails extends Product {
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  images?: string[];
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  brand?: string;
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log('🛍️ [PRODUCT-DETAILS] Chargement du produit:', id);
        setLoading(true);
        
        // Charger le produit depuis l'API
        const response = await apiClient.getProduct(id);
        console.log('🛍️ [PRODUCT-DETAILS] Réponse API:', response);
        
        if (response.data) {
          const productData = response.data.data || response.data;
          console.log('🛍️ [PRODUCT-DETAILS] Produit chargé:', productData);
          console.log('🛍️ [PRODUCT-DETAILS] Image originale:', productData.image);
          console.log('🛍️ [PRODUCT-DETAILS] Images relation:', productData.images);
          console.log('🛍️ [PRODUCT-DETAILS] Type des images:', typeof productData.images, Array.isArray(productData.images));
          
          // Enrichir avec des données par défaut pour l'affichage
          const enrichedProduct: ProductDetails = {
            ...productData,
            description: productData.description || 'Produit de qualité supérieure',
            sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
            colors: productData.colors || ['Blanc', 'Noir', 'Gris'],
            specifications: productData.specifications || null,
            inStock: productData.stock > 0,
            stockCount: productData.stock || 0,
            images: (() => {
              // Si le produit a des images dans la base de données (relation Image)
              if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
                console.log('🖼️ [PRODUCT-DETAILS] Images depuis la base de données:', productData.images);
                return productData.images.map((img: any) => img.url || img);
              }
              
              // Sinon, utiliser l'image principale et générer des variantes
              if (!productData.image) return [];
              
              const baseImages = [productData.image];
              
              // Générer des variantes d'images pour la démonstration
              if (productData.image.includes('dummyjson')) {
                // Pour DummyJSON, générer des variantes réalistes
                const variants = [
                  productData.image.replace('thumbnail', 'image1'),
                  productData.image.replace('thumbnail', 'image2'),
                  productData.image.replace('thumbnail', 'image3'),
                  productData.image.replace('thumbnail', 'image4')
                ].filter(img => img !== productData.image);
                
                return [...baseImages, ...variants];
              } else if (productData.image.includes('fakestoreapi')) {
                // Pour Fake Store API, générer des variantes avec Picsum
                const variants = [
                  'https://picsum.photos/300/300?random=1',
                  'https://picsum.photos/300/300?random=2',
                  'https://picsum.photos/300/300?random=3'
                ];
                
                return [...baseImages, ...variants];
              } else {
                // Pour d'autres sources, générer des variantes avec des paramètres différents
                const variants = [
                  `${productData.image}?v=1&t=${Date.now()}`,
                  `${productData.image}?v=2&t=${Date.now()}`,
                  `${productData.image}?v=3&t=${Date.now()}`
                ];
                
                return [...baseImages, ...variants];
              }
            })(),
            type: productData.category?.name?.toLowerCase().includes('mode') ? 'mode' : 'tech',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 200) + 50,
            brand: productData.supplier?.name || 'KAMRI'
          };
          
          setProduct(enrichedProduct);
          console.log('🛍️ [PRODUCT-DETAILS] Images générées:', enrichedProduct.images);
          console.log('🛍️ [PRODUCT-DETAILS] Nombre d\'images:', enrichedProduct.images.length);
          console.log('🛍️ [PRODUCT-DETAILS] Source d\'image:', productData.image);
          
          // Charger des produits similaires avec logique avancée
          if (productData.category?.id) {
            const similarResponse = await apiClient.getProducts();
            if (similarResponse.data) {
              const allProducts = similarResponse.data.data || similarResponse.data;
              
              // Logique de similarité avancée
              const similar = allProducts
                .filter((p: Product) => p.id !== id) // Exclure le produit actuel
                .map((p: Product) => {
                  let similarityScore = 0;
                  
                  // 1. Même catégorie = +3 points
                  if (p.category?.id === productData.category?.id) {
                    similarityScore += 3;
                  }
                  
                  // 2. Même fournisseur = +2 points
                  if (p.supplier?.name === productData.supplier?.name) {
                    similarityScore += 2;
                  }
                  
                  // 3. Prix similaire (±20%) = +2 points
                  const priceDiff = Math.abs(p.price - productData.price) / productData.price;
                  if (priceDiff <= 0.2) {
                    similarityScore += 2;
                  }
                  
                  // 4. Même gamme de prix = +1 point
                  const isSamePriceRange = 
                    (p.price < 50 && productData.price < 50) ||
                    (p.price >= 50 && p.price < 200 && productData.price >= 50 && productData.price < 200) ||
                    (p.price >= 200 && productData.price >= 200);
                  if (isSamePriceRange) {
                    similarityScore += 1;
                  }
                  
                  // 5. Mots-clés similaires dans le nom = +1 point
                  const currentWords = productData.name.toLowerCase().split(' ');
                  const productWords = p.name.toLowerCase().split(' ');
                  const commonWords = currentWords.filter(word => 
                    word.length > 3 && productWords.includes(word)
                  );
                  if (commonWords.length > 0) {
                    similarityScore += 1;
                  }
                  
                  return {
                    ...p,
                    similarityScore,
                    description: p.description || 'Produit de qualité supérieure',
                    sizes: p.sizes || ['S', 'M', 'L', 'XL'],
                    colors: p.colors || ['Blanc', 'Noir', 'Gris'],
                    specifications: p.specifications || null,
                    inStock: p.stock > 0,
                    stockCount: p.stock || 0,
                    images: p.image ? [p.image] : [],
                    type: p.category?.name?.toLowerCase().includes('mode') ? 'mode' : 'tech',
                    rating: 4.5,
                    reviews: Math.floor(Math.random() * 200) + 50,
                    brand: p.supplier?.name || 'KAMRI'
                  };
                })
                .filter(p => p.similarityScore > 0) // Garder seulement ceux avec une similarité
                .sort((a, b) => b.similarityScore - a.similarityScore) // Trier par score de similarité
                .slice(0, 3) // Prendre les 3 meilleurs
                .map(p => {
                  // Supprimer le score de similarité du résultat final
                  const { similarityScore, ...productWithoutScore } = p;
                  return productWithoutScore;
                });
              
              console.log('🔍 [PRODUCT-DETAILS] Produits similaires trouvés:', similar.length);
              console.log('🔍 [PRODUCT-DETAILS] Critères de similarité appliqués');
              setSimilarProducts(similar);
            }
          }
          
          // Sélectionner la première couleur par défaut
          if (enrichedProduct.colors && enrichedProduct.colors.length > 0) {
            setSelectedColor(enrichedProduct.colors[0]);
          }
        }
      } catch (error) {
        console.error('❌ [PRODUCT-DETAILS] Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
        console.log('🛍️ [PRODUCT-DETAILS] Chargement terminé');
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingIcon}>⏳</ThemedText>
          <ThemedText style={styles.loadingTitle}>Chargement du produit...</ThemedText>
          <ThemedText style={styles.loadingSubtitle}>Veuillez patienter</ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorIcon}>😞</ThemedText>
          <ThemedText style={styles.errorTitle}>Produit non trouvé</ThemedText>
          <ThemedText style={styles.errorSubtitle}>
            Le produit que vous recherchez n'existe pas.
          </ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UnifiedHeader />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[selectedImage] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={64} color="#9CA3AF" />
            </View>
          )}
          
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
        {product.images && product.images.length > 0 && (
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
                <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
                  <Image 
                    source={similarProduct.images && similarProduct.images.length > 0 
                      ? { uri: similarProduct.images[0] } 
                      : require('../../assets/images/modelo.png')
                    } 
                    style={styles.similarImage} 
                    resizeMode="cover" 
                  />
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

      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
    paddingBottom: 120, // Espace pour la barre de navigation courbée
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
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
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
  placeholderImage: {
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
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedThumbnail: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
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
