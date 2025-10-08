import { useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';

// Types pour les produits (temporaire - sera remplacé par l'API)
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

// Données temporaires (sera remplacé par l'API)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999,
    image: 'https://picsum.photos/300/300?random=1',
    category: 'Electronics',
    description: 'Latest iPhone with advanced features'
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    price: 1299,
    image: 'https://picsum.photos/300/300?random=2',
    category: 'Electronics',
    description: 'Powerful laptop for professionals'
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 249,
    image: 'https://picsum.photos/300/300?random=3',
    category: 'Electronics',
    description: 'Premium wireless earbuds'
  },
  {
    id: '4',
    name: 'Nike Air Max',
    price: 120,
    image: 'https://picsum.photos/300/300?random=4',
    category: 'Fashion',
    description: 'Comfortable running shoes'
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24',
    price: 899,
    image: 'https://picsum.photos/300/300?random=5',
    category: 'Electronics',
    description: 'Latest Android smartphone'
  },
  {
    id: '6',
    name: 'Adidas T-Shirt',
    price: 35,
    image: 'https://picsum.photos/300/300?random=6',
    category: 'Fashion',
    description: 'Comfortable cotton t-shirt'
  }
];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

  const onRefresh = () => {
    setRefreshing(true);
    // Simuler un appel API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <ThemedView style={styles.productInfo}>
        <ThemedText type="subtitle" style={styles.productName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.productDescription}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.productFooter}>
          <ThemedText type="defaultSemiBold" style={styles.productPrice}>
            ${item.price}
          </ThemedText>
          <TouchableOpacity style={styles.addButton}>
            <IconSymbol name="plus" size={16} color="#ffffff" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <ThemedText
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive
        ]}
      >
        {category}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Products
        </ThemedText>
        <TouchableOpacity style={styles.searchButton}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategory(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </ThemedView>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  productsList: {
    padding: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
