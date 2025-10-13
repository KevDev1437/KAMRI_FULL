'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

export default function RecommendedProducts() {
  const { cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        console.log('🔄 [RecommendedProducts] Chargement des produits recommandés...');
        setIsLoading(true);
        
        // Récupérer des produits aléatoires de notre API
        const response = await fetch('http://localhost:3001/api/web/products?limit=3', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 [RecommendedProducts] Produits reçus:', data.data?.length || 0);
          
          // Filtrer les produits déjà dans le panier
          const cartItemIds = cartItems.map(item => item.id);
          const availableProducts = data.data.filter((product: any) => 
            !cartItemIds.includes(product.id)
          );
          
          // Prendre les 3 premiers produits disponibles
          const recommendedProducts = availableProducts.slice(0, 3).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
          }));
          
          console.log('📦 [RecommendedProducts] Produits recommandés:', recommendedProducts.length, 'sur', data.data.length, 'disponibles');
          setProducts(recommendedProducts);
        } else {
          console.error('❌ [RecommendedProducts] Erreur API:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('💥 [RecommendedProducts] Erreur:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [cartItems]); // Se relance quand le panier change

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-[#424242] mb-4">Vous pourriez aussi aimer</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement des recommandations...</p>
        </div>
      </motion.div>
    );
  }

  if (products.length === 0) {
    return null; // Ne pas afficher la section si pas de produits
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 mt-6"
    >
      <h3 className="text-lg font-semibold text-[#424242] mb-4">Vous pourriez aussi aimer</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-300 cursor-pointer border border-gray-100 hover:border-[#4CAF50] hover:shadow-md"
            >
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    console.log('❌ [RecommendedProducts] Erreur image:', product.image);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <h4 className="font-medium text-[#424242] text-center mb-1 line-clamp-2">{product.name}</h4>
              <p className="text-sm text-[#4CAF50] font-semibold">${product.price}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
