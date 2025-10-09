
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
      {/* Image placeholder */}
      <div className="h-56 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center relative">
        <svg className="h-16 w-16 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        {/* Favorite button */}
        <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200">
          <svg className="h-5 w-5 text-[#9CA3AF] hover:text-[#FF7043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      {/* Product info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#212121] mb-3 line-clamp-1">{product.name}</h3>
        <p className="text-2xl font-bold text-[#1E88E5] mb-6">{product.price}</p>
        
        <button className="w-full bg-[#1E88E5] text-white py-3 px-6 rounded-full font-bold hover:bg-[#1976D2] hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <div className="py-16 px-6 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4 tracking-tight">
            Nos produits
          </h2>
          <p className="text-xl text-[#9CA3AF] font-light">
            Découvrez notre sélection exclusive
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
