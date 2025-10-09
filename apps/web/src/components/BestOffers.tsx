export default function BestOffers() {
  // Mock data pour les meilleures offres
  const bestOffers = [
    { id: '1', name: 'Pull Cachemire', price: '99.99€', originalPrice: '149.99€', image: null },
    { id: '2', name: 'Chaussures Cuir', price: '119.99€', originalPrice: '179.99€', image: null },
    { id: '3', name: 'Sac à Main', price: '49.99€', originalPrice: '79.99€', image: null },
    { id: '4', name: 'Montre Élégante', price: '89.99€', originalPrice: '129.99€', image: null },
  ];

  interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice: string;
    image: string | null;
  }

  interface ProductCardProps {
    product: Product;
  }

  function ProductCard({ product }: ProductCardProps) {
    return (
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
        {/* Image placeholder */}
        <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative">
          <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          
          {/* Badge Meilleure Offre */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF7043] text-white rounded-full text-xs font-bold">
            Meilleure Offre
          </div>
        </div>
        
        {/* Product info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 mb-6">
            <p className="text-2xl font-bold text-[#4CAF50]">{product.price}</p>
            <p className="text-lg text-[#9CA3AF] line-through">{product.originalPrice}</p>
          </div>
          
          <button className="w-full bg-[#4CAF50] text-white py-3 px-6 rounded-full font-bold hover:bg-[#2E7D32] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-6 bg-[#E8F5E8]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#424242] mb-4 tracking-tight">
            Meilleures Offres
          </h2>
          <p className="text-xl text-[#81C784] font-light">
            Découvrez nos promotions exclusives
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestOffers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
