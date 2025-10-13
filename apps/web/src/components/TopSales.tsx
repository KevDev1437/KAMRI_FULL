export default function TopSales() {
  // TODO: Remplacer par des données réelles du backend
  const topSales: Product[] = [];

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
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
        {/* Image placeholder */}
        <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative">
          <svg className="h-16 w-16 text-[#81C784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          
          {/* Badge Top Vente */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#4CAF50] text-white rounded-full text-xs font-bold">
            Top Vente
          </div>
        </div>
        
        {/* Product info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#424242] mb-3 line-clamp-1">{product.name}</h3>
          <p className="text-2xl font-bold text-[#4CAF50] mb-6">{product.price}</p>
          
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
            Top Ventes
          </h2>
          <p className="text-xl text-[#81C784] font-light">
            Nos produits les plus vendus
          </p>
        </div>
        
        {topSales.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topSales.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-[#424242] mb-2">
              Aucun produit en top ventes
            </h3>
            <p className="text-[#81C784]">
              Aucun produit n'est disponible dans les top ventes pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}