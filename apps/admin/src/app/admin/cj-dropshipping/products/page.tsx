'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJProduct, CJProductSearchFilters } from '@/types/cj.types';
import { useState } from 'react';

export default function CJProductsPage() {
  const {
    loading,
    error,
    searchProducts,
    importProduct,
    syncProducts,
  } = useCJDropshipping();

  const [products, setProducts] = useState<CJProduct[]>([]);
  const [filters, setFilters] = useState<CJProductSearchFilters>({
    keyword: '',
    pageNum: 1,
    pageSize: 20,
    minPrice: undefined,
    maxPrice: undefined,
    countryCode: 'US',
    sortBy: 'relevance',
  });
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSearch = async () => {
    if (!filters.keyword?.trim()) {
      alert('Veuillez entrer un mot-clé de recherche');
      return;
    }

    setSearching(true);
    setProducts([]); // Effacer les résultats précédents
    try {
      const results = await searchProducts(filters);
      setProducts(results);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setProducts([]); // Effacer en cas d'erreur
    } finally {
      setSearching(false);
    }
  };

  const handleKeywordChange = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    // Effacer les résultats quand l'utilisateur tape un nouveau mot-clé
    if (products.length > 0) {
      setProducts([]);
    }
  };

  const handleImport = async (pid: string) => {
    setImporting(pid);
    try {
      const result = await importProduct(pid);
      if (result.success) {
        alert('✅ Produit importé avec succès !');
        // Marquer le produit comme importé visuellement
        setProducts(prev => prev.map(p => 
          p.pid === pid ? { ...p, imported: true } : p
        ));
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de l\'import du produit');
    } finally {
      setImporting(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncProducts();
      alert(`✅ Synchronisation terminée: ${result.synced} produits mis à jour, ${result.errors} erreurs`);
    } catch (err) {
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Produits CJ Dropshipping
        </h1>
        <p className="text-gray-600">
          Recherchez et importez des produits depuis CJ Dropshipping
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtres de recherche */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Rechercher des produits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot-clé *
            </label>
            <Input
              type="text"
              value={filters.keyword || ''}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Ex: phone case, watch, bag"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix minimum
            </label>
            <Input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                minPrice: e.target.value ? Number(e.target.value) : undefined 
              }))}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix maximum
            </label>
            <Input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                maxPrice: e.target.value ? Number(e.target.value) : undefined 
              }))}
              placeholder="100.00"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <select
              value={filters.countryCode || 'US'}
              onChange={(e) => setFilters(prev => ({ ...prev, countryCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="US">États-Unis</option>
              <option value="FR">France</option>
              <option value="DE">Allemagne</option>
              <option value="GB">Royaume-Uni</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSearch}
            disabled={searching || !filters.keyword?.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {searching ? 'Recherche...' : 'Rechercher'}
          </Button>
          
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
          >
            {syncing ? 'Synchronisation...' : 'Synchroniser les produits'}
          </Button>
        </div>
      </Card>

      {/* Résultats de recherche */}
      {products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Résultats ({products.length} produits trouvés)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.pid} className="overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.productImage}
                    alt={product.productNameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.productNameEn || product.productName}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prix</span>
                      <span className="font-bold text-green-600">
                        ${isNaN(parseFloat(product.sellPrice)) ? '0.00' : parseFloat(product.sellPrice).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">SKU</span>
                      <span className="text-sm font-mono">{product.productSku}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock</span>
                      <span className="text-sm">
                        {product.variants?.[0]?.stock || 0} unités
                      </span>
                    </div>
                    
                    {product.rating > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Note</span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm ml-1">
                            {product.rating.toFixed(1)} ({product.totalReviews})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleImport(product.pid)}
                      disabled={importing === product.pid}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {importing === product.pid ? 'Import...' : 'Importer'}
                    </Button>
                    
                    <Button
                      onClick={() => window.open(`/admin/cj-dropshipping/products/${product.pid}`, '_blank')}
                      variant="outline"
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {products.length === 0 && !searching && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
            <p>Utilisez les filtres ci-dessus pour rechercher des produits CJ Dropshipping</p>
          </div>
        </Card>
      )}
    </div>
  );
}

