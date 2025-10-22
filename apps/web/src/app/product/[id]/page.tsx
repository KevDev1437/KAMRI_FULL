'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeFooter from '../../../components/HomeFooter';
import ModernHeader from '../../../components/ModernHeader';
import ProductImageGallery from '../../../components/ProductImageGallery';
import ProductInfo from '../../../components/ProductInfo';
import SimilarProducts from '../../../components/SimilarProducts';
import { apiClient } from '../../../lib/api';


interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: Array<{ url: string; alt?: string }>; // ✅ Structure correcte pour les images
  category?: {
    id: string;
    name: string;
  };
  type?: 'mode' | 'tech';
  rating?: number;
  reviews?: number;
  badge?: string;
  brand?: string;
  supplier?: {
    name: string;
  };
  description?: string;
  sizes?: string[] | null;
  colors?: string[];
  specifications?: Record<string, string> | null;
  inStock?: boolean;
  stockCount?: number;
  stock: number;
  status: string;
}

// Fonction pour récupérer des produits similaires
function getSimilarProducts(allProducts: Product[], category: string, currentId: string): Product[] {
  return allProducts
    .filter(product => product.category?.name === category && product.id !== currentId)
    .slice(0, 4);
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Charger le produit spécifique
        const productResponse = await apiClient.getProduct(productId);
        console.log('🔍 [ProductDetail] Response from API:', productResponse);
        
        if (productResponse.data) {
          // L'API backend retourne { data: product, message: '...' }
          // Notre API client retourne { data: { data: product, message: '...' } }
          const backendData = productResponse.data.data || productResponse.data;
          console.log('📦 [ProductDetail] Product data:', backendData);
          setProduct(backendData);
          
          // Charger tous les produits pour les produits similaires
          const productsResponse = await apiClient.getProducts();
          if (productsResponse.data) {
            // Même logique pour les produits
            const backendProductsData = productsResponse.data.data || productsResponse.data;
            const products = Array.isArray(backendProductsData) ? backendProductsData : [];
            setAllProducts(products);
            
            // Trouver des produits similaires
            const similar = getSimilarProducts(
              products, 
              backendData.category?.name || '', 
              productId
            );
            setSimilarProducts(similar);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <ModernHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-[#424242] mb-2">Produit non trouvé</h1>
            <p className="text-[#81C784]">Le produit que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galerie d'images */}
          <ProductImageGallery 
            images={product.images || [product.image || '/images/modelo.png']}
            mainImage={product.image || '/images/modelo.png'}
            productName={product.name}
          />
          
          {/* Informations produit */}
          <ProductInfo product={product} />
        </div>
        
        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <SimilarProducts products={similarProducts} />
          </div>
        )}
      </div>
      
      <HomeFooter />
    </div>
  );
}
