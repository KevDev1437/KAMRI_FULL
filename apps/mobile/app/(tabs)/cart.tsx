import { Ionicons } from '@expo/vector-icons';
import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useCounters } from '../../contexts/CounterContext';
import { apiClient } from '../../lib/api';

export default function CartScreen() {
  const { user, isAuthenticated } = useAuth();
  const { cartCount, syncFromAPI } = useCounters();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Charger le panier depuis l'API
  const loadCart = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ [PANIER-MOBILE] Utilisateur non connecté');
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🛒 [PANIER-MOBILE] Chargement du panier pour:', user.email);
      setLoading(true);
      
      const response = await apiClient.getCart();
      if (response.data) {
        const cartData = response.data.data || response.data;
        const cartItemsArray = Array.isArray(cartData) ? cartData : [];
        
        // Extraire les données des produits depuis la structure imbriquée
        const extractedCartItems = cartItemsArray.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity || 1,
          addedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue',
          ...item.product, // Extraire toutes les propriétés du produit
        }));
        
        setCartItems(extractedCartItems);
        console.log('🛒 [PANIER-MOBILE] Panier chargé:', extractedCartItems);
        
        // Calculer la quantité totale et synchroniser le compteur
        const totalQuantity = extractedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        syncFromAPI(0, totalQuantity); // On ne met à jour que le panier ici
      } else {
        console.log('❌ [PANIER-MOBILE] Aucune donnée de panier reçue');
        console.log('❌ [PANIER-MOBILE] Erreur:', response.error);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ [PANIER-MOBILE] Erreur lors du chargement du panier:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Recharger le panier quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [isAuthenticated, user])
  );

  // Charger le panier au montage
  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user]);

  // Recharger le panier quand le compteur change (ajout/suppression depuis d'autres pages)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [PANIER-MOBILE] Compteur panier changé, rechargement...');
      loadCart();
    }
  }, [cartCount, isAuthenticated, user]);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.savings * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const promoDiscount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;
  
  // Calcul du pourcentage moyen de réduction
  const itemsWithDiscount = cartItems.filter(item => item.originalPrice > item.price);
  const averageDiscountPercentage = itemsWithDiscount.length > 0 
    ? itemsWithDiscount.reduce((sum, item) => sum + calculateDiscountPercentage(item.originalPrice, item.price), 0) / itemsWithDiscount.length
    : 0;

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      console.log('🛒 [PANIER-MOBILE] Mise à jour quantité:', itemId, 'vers', newQuantity);
      
      // Pour l'instant, on supprime et on rajoute avec la nouvelle quantité
      // TODO: Créer un endpoint PATCH pour mettre à jour la quantité
      const item = cartItems.find(item => item.id === itemId);
      if (item) {
        await apiClient.removeFromCart(itemId);
        if (newQuantity > 0) {
          await apiClient.addToCart(item.productId, newQuantity);
        }
        await loadCart(); // Recharger le panier
      }
    } catch (error) {
      console.error('❌ [PANIER-MOBILE] Erreur lors de la mise à jour de la quantité:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
    }
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article de votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [PANIER-MOBILE] Suppression article:', itemId);
              await apiClient.removeFromCart(itemId);
              await loadCart(); // Recharger le panier
              setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
              });
            } catch (error) {
              console.error('❌ [PANIER-MOBILE] Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            }
          }
        }
      ]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const applyPromoCode = () => {
    if (promoCode === 'WELCOME10') {
      Alert.alert('Code appliqué !', 'Réduction de 10% appliquée');
    } else {
      Alert.alert('Code invalide', 'Le code promo n\'est pas valide');
    }
  };

  const clearCart = () => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [PANIER-MOBILE] Vidage du panier');
              await apiClient.clearCart();
              await loadCart(); // Recharger le panier
              setSelectedItems(new Set());
            } catch (error) {
              console.error('❌ [PANIER-MOBILE] Erreur lors du vidage:', error);
              Alert.alert('Erreur', 'Impossible de vider le panier');
            }
          }
        }
      ]
    );
  };

  const proceedToCheckout = () => {
    const selectedCount = selectedItems.size;
    if (selectedCount === 0) {
      Alert.alert('Panier vide', 'Veuillez sélectionner au moins un article');
      return;
    }
    Alert.alert('Commande', `Procéder au paiement de ${selectedCount} article(s) pour ${total.toFixed(2)}€`);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => toggleItemSelection(item.id)}
      >
        <Ionicons 
          name={selectedItems.has(item.id) ? "checkbox" : "square-outline"} 
          size={24} 
          color={selectedItems.has(item.id) ? "#4CAF50" : "#9CA3AF"} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemVariant}>{item.size} • {item.color}</ThemedText>
        
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>{item.price}€</ThemedText>
            {item.originalPrice > item.price && (
              <ThemedText style={styles.originalPrice}>{item.originalPrice}€</ThemedText>
            )}
          </View>
          {item.originalPrice > item.price && (
            <View style={styles.savingsBadge}>
              <ThemedText style={styles.savingsText}>
                {formatDiscountPercentage(calculateDiscountPercentage(item.originalPrice, item.price))}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#4CAF50" />
            </TouchableOpacity>
            <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF5722" />
          </TouchableOpacity>
        </View>

        {item.stock <= 0 && (
          <View style={styles.outOfStockBadge}>
            <ThemedText style={styles.outOfStockText}>Rupture de stock</ThemedText>
          </View>
        )}
      </View>
    </View>
  );

  // Affichage pour utilisateur non connecté
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.notConnectedContainer}>
          <ThemedText style={styles.notConnectedTitle}>Connexion requise</ThemedText>
          <ThemedText style={styles.notConnectedSubtitle}>
            Connectez-vous pour voir votre panier
          </ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  // Affichage de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <UnifiedHeader />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Chargement de votre panier...</ThemedText>
        </View>
        <CurvedBottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UnifiedHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient colors={['#EAF3EE', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBackground} />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>Mon Panier</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{cartItems.length} article(s) dans votre panier</ThemedText>
          </View>
        </View>

        {/* Header avec sélection */}
        <View style={styles.cartHeader}>
          <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
            <Ionicons 
              name={selectedItems.size === cartItems.length ? "checkbox" : "square-outline"} 
              size={20} 
              color={selectedItems.size === cartItems.length ? "#4CAF50" : "#9CA3AF"} 
            />
            <ThemedText style={styles.selectAllText}>
              {selectedItems.size === cartItems.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              Alert.alert('Vider le panier', 'Êtes-vous sûr de vouloir vider votre panier ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Vider', style: 'destructive', onPress: () => setCartItems([]) }
              ]);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#FF5722" />
            <ThemedText style={styles.clearText}>Vider</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Liste des articles */}
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.cartList}
        />

        {/* Code promo */}
        <View style={styles.promoSection}>
          <View style={styles.promoHeader}>
            <ThemedText style={styles.promoTitle}>Code promo</ThemedText>
            <TouchableOpacity 
              style={styles.promoToggle}
              onPress={() => setShowPromoInput(!showPromoInput)}
            >
              <ThemedText style={styles.promoToggleText}>
                {showPromoInput ? 'Masquer' : 'J\'ai un code'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {showPromoInput && (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Entrez votre code promo"
                value={promoCode}
                onChangeText={setPromoCode}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.applyButton} onPress={applyPromoCode}>
                <ThemedText style={styles.applyButtonText}>Appliquer</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Résumé des prix */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryTitle}>Résumé de la commande</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Sous-total</ThemedText>
            <ThemedText style={styles.summaryValue}>{subtotal.toFixed(2)}€</ThemedText>
          </View>
          
          {averageDiscountPercentage > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Économies</ThemedText>
              <ThemedText style={[styles.summaryValue, styles.savingsValue]}>
                {formatDiscountPercentage(Math.round(averageDiscountPercentage))}
              </ThemedText>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Livraison</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
            </ThemedText>
          </View>
          
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Réduction promo</ThemedText>
              <ThemedText style={[styles.summaryValue, styles.savingsValue]}>-{promoDiscount.toFixed(2)}€</ThemedText>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>{total.toFixed(2)}€</ThemedText>
          </View>
        </View>

        {/* Section de commande intégrée */}
        <View style={styles.checkoutSection}>
          <View style={styles.checkoutInfo}>
            <ThemedText style={styles.checkoutCount}>
              {selectedItems.size} article(s) sélectionné(s)
            </ThemedText>
            <ThemedText style={styles.checkoutTotal}>{total.toFixed(2)}€</ThemedText>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
            <ThemedText style={styles.checkoutButtonText}>Commander</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Produits recommandés */}
        <View style={styles.recommendationsSection}>
          <ThemedText style={styles.recommendationsTitle}>Vous pourriez aussi aimer</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsList}>
            {[
              { name: 'iPhone 15', price: 999, image: 'https://images.unsplash.com/photo-1592899677977-9d26d3ba4f33?w=200' },
              { name: 'AirPods Max', price: 549, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200' },
              { name: 'Apple Watch', price: 399, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200' }
            ].map((product, index) => (
              <TouchableOpacity key={index} style={styles.recommendationCard}>
                <Image source={{ uri: product.image }} style={styles.recommendationImage} />
                <ThemedText style={styles.recommendationName}>{product.name}</ThemedText>
                <ThemedText style={styles.recommendationPrice}>{product.price}€</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <HomeFooter />
      </ScrollView>

      <CurvedBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 100, // Espace pour la barre de navigation courbée
  },
  scrollView: {
    flex: 1,
    marginTop: -8, // Réduire l'espace entre header et contenu
    paddingBottom: 120, // Espace suffisant pour la barre de navigation courbée
  },
  // Hero Section
  heroContainer: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  // Cart Header
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '500',
  },
  // Cart List
  cartList: {
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButton: {
    marginRight: 12,
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  outOfStockBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  outOfStockText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
  },
  // Promo Section
  promoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  promoToggle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  promoToggleText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#424242',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Summary Section
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#424242',
  },
  summaryValue: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  savingsValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Recommendations
  recommendationsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  recommendationsList: {
    flexDirection: 'row',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationImage: {
    width: 116,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Checkout Section (intégrée dans le scroll)
  checkoutSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Nouveaux styles pour les états
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  notConnectedSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
});