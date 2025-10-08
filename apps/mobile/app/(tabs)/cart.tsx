import { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Données temporaires (sera remplacé par l'API)
const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999,
    image: 'https://picsum.photos/300/300?random=1',
    quantity: 1,
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    price: 1299,
    image: 'https://picsum.photos/300/300?random=2',
    quantity: 1,
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 249,
    image: 'https://picsum.photos/300/300?random=3',
    quantity: 2,
  },
];

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

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
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setCartItems(items => items.filter(item => item.id !== id))
        }
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const renderCartItem = (item: CartItem) => (
    <ThemedView key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <ThemedView style={styles.itemInfo}>
        <ThemedText type="subtitle" style={styles.itemName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemPrice}>
          ${item.price}
        </ThemedText>
        <ThemedView style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <IconSymbol name="minus" size={16} color="#6b7280" />
          </TouchableOpacity>
          <ThemedText style={styles.quantityText}>
            {item.quantity}
          </ThemedText>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <IconSymbol name="plus" size={16} color="#6b7280" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <IconSymbol name="trash" size={20} color="#ef4444" />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Shopping Cart
        </ThemedText>
        <ThemedText style={styles.itemCount}>
          {getTotalItems()} items
        </ThemedText>
      </ThemedView>

      {cartItems.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="bag" size={64} color="#d1d5db" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Your cart is empty
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Add some products to get started
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.cartItems}>
            {cartItems.map(renderCartItem)}
          </ThemedView>

          <ThemedView style={styles.footer}>
            <ThemedView style={styles.totalContainer}>
              <ThemedText type="subtitle" style={styles.totalLabel}>
                Total
              </ThemedText>
              <ThemedText type="title" style={styles.totalPrice}>
                ${getTotalPrice().toFixed(2)}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity style={styles.checkoutButton}>
              <ThemedText style={styles.checkoutButtonText}>
                Proceed to Checkout
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  cartItems: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 10,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  checkoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
