import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Mock data pour les produits
const mockProducts = [
  { id: '1', name: 'T-Shirt Premium', price: '29.99€', image: null },
  { id: '2', name: 'Jean Slim Fit', price: '59.99€', image: null },
  { id: '3', name: 'Sneakers Sport', price: '89.99€', image: null },
  { id: '4', name: 'Veste Denim', price: '79.99€', image: null },
  { id: '5', name: 'Pull Cachemire', price: '129.99€', image: null },
  { id: '6', name: 'Chaussures Cuir', price: '149.99€', image: null },
];

interface Product {
  id: string;
  name: string;
  price: string;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <ThemedView style={styles.productCard}>
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        <ThemedView style={styles.imagePlaceholder}>
          <ThemedText style={styles.imageText}>Image</ThemedText>
        </ThemedView>
      </View>
      
      {/* Product info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
        
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>Ajouter au panier</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function ProductGrid() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Nos produits</ThemedText>
      
      <View style={styles.grid}>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  imageText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
