'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernHeader from '../../../components/ModernHeader';
import ProductImageGallery from '../../../components/ProductImageGallery';
import ProductInfo from '../../../components/ProductInfo';
import SimilarProducts from '../../../components/SimilarProducts';

// Mock data pour les produits
const mockProducts = [
  { 
    id: '1', 
    name: 'T-Shirt Premium', 
    price: 29.99, 
    originalPrice: 39.99,
    image: '/modelo.png',
    images: ['/modelo.png', '/modelo.png', '/modelo.png'],
    category: 'mode',
    type: 'mode',
    rating: 4.5,
    reviews: 128,
    badge: 'tendance',
    brand: 'KAMRI',
    description: 'T-shirt en coton bio premium avec coupe moderne et confortable. Parfait pour toutes les occasions.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Noir', 'Gris'],
    specifications: null,
    inStock: true,
    stockCount: 15
  },
  { 
    id: '2', 
    name: 'Smartphone Pro', 
    price: 899.99, 
    originalPrice: 999.99,
    image: '/modelo.png',
    images: ['/modelo.png', '/modelo.png', '/modelo.png'],
    category: 'technologie',
    type: 'tech',
    rating: 4.8,
    reviews: 256,
    badge: 'promo',
    brand: 'TechBrand',
    description: 'Smartphone haut de gamme avec écran OLED 6.7", processeur 8 cœurs et caméra 108MP.',
    sizes: null,
    colors: ['Noir', 'Blanc', 'Bleu'],
    specifications: {
      'Écran': '6.7" OLED',
      'Processeur': '8 cœurs 3.2GHz',
      'Mémoire': '256GB',
      'Caméra': '108MP',
      'Batterie': '5000mAh',
      'OS': 'Android 14'
    },
    inStock: true,
    stockCount: 8
  },
  { 
    id: '3', 
    name: 'Jean Slim Fit', 
    price: 59.99, 
    originalPrice: null,
    image: '/modelo.png',
    images: ['/modelo.png', '/modelo.png', '/modelo.png'],
    category: 'mode',
    type: 'mode',
    rating: 4.2,
    reviews: 89,
    badge: 'nouveau',
    brand: 'KAMRI',
    description: 'Jean slim fit en denim stretch pour un confort optimal et un style moderne.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Bleu', 'Noir'],
    specifications: null,
    inStock: true,
    stockCount: 12
  },
  { 
    id: '4', 
    name: 'Laptop Gaming', 
    price: 1299.99, 
    originalPrice: 1499.99,
    image: '/modelo.png',
    images: ['/modelo.png', '/modelo.png', '/modelo.png'],
    category: 'technologie',
    type: 'tech',
    rating: 4.7,
    reviews: 189,
    badge: 'promo',
    brand: 'GameTech',
    description: 'Laptop gaming haute performance avec carte graphique dédiée et écran 144Hz.',
    sizes: null,
    colors: ['Noir', 'Rouge'],
    specifications: {
      'Processeur': 'Intel i7-12700H',
      'Carte Graphique': 'RTX 4060 8GB',
      'RAM': '16GB DDR5',
      'Stockage': '512GB SSD',
      'Écran': '15.6" 144Hz',
      'OS': 'Windows 11'
    },
    inStock: true,
    stockCount: 5
  }
];

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  category: string;
  type: 'mode' | 'tech';
  rating: number;
  reviews: number;
  badge: string | null;
  brand: string;
  description: string;
  sizes: string[] | null;
  colors: string[];
  specifications: Record<string, string> | null;
  inStock: boolean;
  stockCount: number;
}

// Fonction pour récupérer un produit par ID
function getProductById(id: string): Product | null {
  return mockProducts.find(product => product.id === id) || null;
}

// Fonction pour récupérer des produits similaires
function getSimilarProducts(category: string, currentId: string): Product[] {
  return mockProducts
    .filter(product => product.category === category && product.id !== currentId)
    .slice(0, 4);
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundProduct = getProductById(productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSimilarProducts(getSimilarProducts(foundProduct.category, foundProduct.id));
    }
    setLoading(false);
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
            images={product.images}
            mainImage={product.image}
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
    </div>
  );
}
