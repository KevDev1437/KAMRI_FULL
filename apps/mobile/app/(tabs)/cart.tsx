import { Ionicons } from '@expo/vector-icons';
import { calculateDiscountPercentage, formatDiscountPercentage } from '@kamri/lib';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CurvedBottomNav from '../../components/CurvedBottomNav';
import HomeFooter from '../../components/HomeFooter';
import { ThemedText } from '../../components/themed-text';
import UnifiedHeader from '../../components/UnifiedHeader';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        // Simulation d'appel API - pour l'instant retourne un tableau vide
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCartItems([]);
        setSelectedItems(new Set());
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        setCartItems([]);
        setSelectedItems(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.savings * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const promoDiscount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article de votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setCartItems(items => items.filter(item => item.id !== id));
            setSelectedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        }
      ]
    );
  };

  const toggleSelection = (id: string) => {
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
      Alert.alert('Code appliqué !', 'Vous avez 10% de réduction sur votre commande');
    } else {
      Alert.alert('Code invalide', 'Le code promo n\'est pas valide');
    }
  };

  const proceedToCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Panier vide', 'Veuillez sélectionner au moins un article');
      return;
    }
    Alert.alert('Commande', 'Fonctionnalité de commande bientôt disponible');
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.has(item.id);
    const discountPercentage = item.originalPrice > item.price 
      ? calculateDiscountPercentage(item.originalPrice, item.price)
      : 0;

    return (
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => toggleSelection(item.id)}
        >
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={20} 
            color={isSelected ? "#4CAF50" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <Image source={{ uri: item.image }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <ThemedText style={styles.itemVariant}>
            {item.size} • {item.color}
          </ThemedText>
          
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.currentPrice}>${item.price}</ThemedText>
              {item.originalPrice > item.price && (
                <ThemedText style={styles.originalPrice}>${item.originalPrice}</ThemedText>
              )}
              {item.savings > 0 && (
                <View style={styles.savingsBadge}>
                  <ThemedText style={styles.savingsText}>
                    -${item.savings}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#424242" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#424242" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>

          {!item.inStock && (
            <View style={styles.outOfStockBadge}>
              <ThemedText style={styles.outOfStockText}>Rupture de stock</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

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

        {/* État de chargement */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Chargement de votre panier...</ThemedText>
          </View>
        ) : cartItems.length > 0 ? (
          <>
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
              
              <TouchableOpacity style={styles.clearButton}>
                <Ionicons name="trash-outline" size={16} color="#FF5722" />
                <ThemedText style={styles.clearText}>Vider</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Liste des articles */}
            <View style={styles.cartList}>
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>

            {/* Section Promo */}
            <View style={styles.promoSection}>
              <View style={styles.promoHeader}>
                <ThemedText style={styles.promoTitle}>Code promo</ThemedText>
                <TouchableOpacity 
                  style={styles.promoToggle}
                  onPress={() => setShowPromoInput(!showPromoInput)}
                >
                  <ThemedText style={styles.promoToggleText}>
                    {showPromoInput ? 'Masquer' : 'Ajouter'}
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

            {/* Résumé de la commande */}
            <View style={styles.summaryContainer}>
              <ThemedText style={styles.summaryTitle}>Résumé de la commande</ThemedText>
              
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Sous-total</ThemedText>
                <ThemedText style={styles.summaryValue}>${subtotal.toFixed(2)}</ThemedText>
              </View>
              
              {totalSavings > 0 && (
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Économies</ThemedText>
                  <ThemedText style={[styles.summaryValue, styles.savingsValue]}>
                    -${totalSavings.toFixed(2)}
                  </ThemedText>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Livraison</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {shipping === 0 ? 'Gratuite' : `$${shipping.toFixed(2)}`}
                </ThemedText>
              </View>
              
              {promoDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Réduction promo</ThemedText>
                  <ThemedText style={[styles.summaryValue, styles.savingsValue]}>
                    -${promoDiscount.toFixed(2)}
                  </ThemedText>
                </View>
              )}
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText style={styles.totalLabel}>Total</ThemedText>
                <ThemedText style={styles.totalValue}>${total.toFixed(2)}</ThemedText>
              </View>
            </View>

            {/* Recommandations */}
            <View style={styles.recommendationsSection}>
              <ThemedText style={styles.recommendationsTitle}>Vous pourriez aussi aimer</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsList}>
                {/* TODO: Ajouter des recommandations depuis l'API */}
              </ScrollView>
            </View>

            {/* Section Checkout */}
            <View style={styles.checkoutSection}>
              <View style={styles.checkoutInfo}>
                <ThemedText style={styles.checkoutCount}>
                  {selectedItems.size} article(s) sélectionné(s)
                </ThemedText>
                <ThemedText style={styles.checkoutTotal}>
                  ${total.toFixed(2)}
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <ThemedText style={styles.checkoutButtonText}>Commander</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyTitle}>Votre panier est vide</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Ajoutez des produits à votre panier pour commencer vos achats
            </ThemedText>
          </View>
        )}

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
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
    marginTop: -8,
    paddingBottom: 120,
  },
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});