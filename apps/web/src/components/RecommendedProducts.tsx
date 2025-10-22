'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { apiClient, Product } from '../lib/api';

// Fonction utilitaire pour nettoyer les URLs d'images
const getCleanImageUrl = (image: string | string[] | null | undefined): string | null => {
  if (!image) return null;
  
  if (typeof image === 'string') {
    // Si c'est une string, vérifier si c'est un JSON
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return image;
    } catch {
      return image;
    }
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }
  
  return null;
};

export default function RecommendedProducts() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      console.log('✅ Produit ajouté au panier:', productId);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout au panier:', error);
    }
  };

  useEffect(() => {
    const loadRecommendedProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts();
        
        if (response.data) {
          // Récupérer les données depuis l'API
          const backendData = response.data.data || response.data;
          const products = Array.isArray(backendData) ? backendData : [];
          
          // Prendre 3 produits aléatoires parmi les produits actifs
          const activeProducts = products.filter((product: Product) => product.status === 'active');
          const shuffled = activeProducts.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          
          setRecommendedProducts(selected);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits recommandés:', error);
        setRecommendedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedProducts();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-[#424242] mb-4">Vous pourriez aussi aimer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex flex-col items-center p-4 border border-gray-100 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (recommendedProducts.length === 0) {
    return null; // Ne pas afficher la section si aucun produit
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
        {recommendedProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-300 border border-gray-100"
          >
            <a 
              href={`/product/${product.id}`}
              className="flex flex-col items-center w-full"
            >
              {(() => {
                const imageUrl = getCleanImageUrl(product.image);
                return imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-16 h-16 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null;
              })()}
              <div className={`${getCleanImageUrl(product.image) ? 'hidden' : 'flex'} w-16 h-16 bg-gray-100 rounded-lg mb-3 items-center justify-center`}>
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-[#424242] text-center mb-1 line-clamp-2">
                {product.name}
              </h4>
              <p className="text-sm text-[#4CAF50] font-semibold mb-3">
                {product.price}€
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-500 line-through ml-1">
                    {product.originalPrice}€
                  </span>
                )}
              </p>
            </a>
            
            {/* Bouton Ajouter au panier */}
            <button
              onClick={() => handleAddToCart(product.id)}
              className="w-full px-3 py-2 bg-[#4CAF50] text-white text-sm rounded-lg hover:bg-[#45a049] transition-colors duration-300"
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
