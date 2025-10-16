
'use client';

import { useApp } from '../contexts/AppContext';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { products, isLoading, error } = useApp();

  if (isLoading) {
    return (
      <div className="py-20 px-6 bg-[#E8F5E8]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
              Nos produits
            </h2>
            <p className="text-xl text-[#81C784] font-light font-['Inter']">
              Chargement des produits...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-6 bg-[#E8F5E8]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
              Nos produits
            </h2>
            <p className="text-xl text-red-500 font-light font-['Inter']">
              Erreur: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight font-['Inter']">
            Nos produits
          </h2>
          <p className="text-xl text-[#81C784] font-light font-['Inter']">
            Découvrez notre sélection exclusive ({products.length} produits)
          </p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
