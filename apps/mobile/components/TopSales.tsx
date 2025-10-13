import { Ionicons } from '@expo/vector-icons';
import { getBadgeConfig } from '@kamri/lib';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const cardWidth = isTablet ? (width - 60) / 4 : (width - 60) / 2;

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
  // Utilisation des couleurs d'étiquettes cohérentes pour "top-ventes"
  const badgeConfig = getBadgeConfig('top-ventes');
  
  return (
    <ThemedView style={[styles.productCard, { width: cardWidth }]}>
      {/* Image placeholder */}
      <View style={styles.imageContainer}>
        <ThemedView style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#81C784" />
        </ThemedView>
        
        {/* Badge Top Vente */}
        <View style={[styles.badge, { backgroundColor: badgeConfig.backgroundColor }]}>
          <ThemedText style={[styles.badgeText, { color: badgeConfig.color }]}>
            {badgeConfig.icon} {badgeConfig.text}
          </ThemedText>
        </View>
      </View>
      
      {/* Product info */}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={1}>
          {product.name}
        </ThemedText>
        
        <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Ajouter</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function TopSales() {
  const [topSales, setTopSales] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const fetchTopSales = async () => {
      try {
        setIsLoading(true);
        // Simulation d'appel API - pour l'instant retourne un tableau vide
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTopSales([]);
      } catch (error) {
        console.error('Erreur lors du chargement des top ventes:', error);
        setTopSales([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSales();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.sectionTitle}>Top Ventes</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Nos produits les plus vendus
        </ThemedText>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Chargement des top ventes...</ThemedText>
        </View>
      ) : topSales.length > 0 ? (
        <View style={styles.grid}>
          {topSales.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={48} color="#81C784" />
          <ThemedText style={styles.emptyText}>Aucun produit en top ventes pour le moment</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
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
    backgroundColor: '#4CAF50',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#81C784',
    textAlign: 'center',
  },
});
