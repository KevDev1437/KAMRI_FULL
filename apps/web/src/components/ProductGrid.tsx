
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image placeholder */}
      <div className="h-48 bg-[#E0E0E0] flex items-center justify-center">
        <span className="text-[#9CA3AF] text-sm">Image</span>
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#212121] mb-2">{product.name}</h3>
        <p className="text-xl font-bold text-[#1E88E5] mb-4">{product.price}</p>
        
        <button className="w-full bg-[#FF7043] text-white py-2 px-4 rounded-full font-bold hover:bg-[#F4511E] transition-colors">
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <div className="py-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#212121] text-center mb-8">Nos produits</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
