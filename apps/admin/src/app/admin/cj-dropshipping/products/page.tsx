'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCJDropshipping } from '@/hooks/useCJDropshipping';
import { CJProduct, CJProductSearchFilters } from '@/types/cj.types';
import { useEffect, useState } from 'react';

export default function CJProductsPage() {
  const {
    loading,
    error,
    getDefaultProducts,
    searchProducts,
    importProduct,
    syncProducts,
    getCategories,
    syncCategories,
  } = useCJDropshipping();

  const [products, setProducts] = useState<CJProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<CJProductSearchFilters>({
    keyword: '',
    pageNum: 1,
    pageSize: 50, // Augmenter le nombre de produits par page
    minPrice: undefined,
    maxPrice: undefined,
    countryCode: 'US',
    sortBy: 'relevance',
    categoryId: undefined, // Ajouter le filtre de catégorie
  });
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Charger les catégories au montage du composant
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        console.log('Catégories chargées:', categoriesData.length);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Charger les produits par défaut au montage du composant
  useEffect(() => {
    const loadDefaultProducts = async () => {
      setLoadingDefault(true);
      try {
        const defaultProducts = await getDefaultProducts({
          pageNum: 1,
          pageSize: 50, // Augmenter à 50 produits
          countryCode: 'US'
        });
        setProducts(defaultProducts);
        setCurrentPage(1); // Initialiser la page courante
        setHasMoreProducts(defaultProducts.length === 50); // S'il y a 50 produits, il peut y en avoir plus
        console.log('Produits par défaut chargés:', defaultProducts.length);
      } catch (err) {
        console.error('Erreur lors du chargement des produits par défaut:', err);
      } finally {
        setLoadingDefault(false);
      }
    };

    loadDefaultProducts();
  }, []); // Supprimer getDefaultProducts de la dépendance

  const loadMoreProducts = async () => {
    if (loadingDefault || !hasMoreProducts) return;
    
    setLoadingDefault(true);
    try {
      const nextPage = currentPage + 1;
      console.log(`🔄 Chargement page ${nextPage} (page courante: ${currentPage})`);
      
      const moreProducts = await getDefaultProducts({
        pageNum: nextPage,
        pageSize: 50,
        countryCode: 'US'
      });
      
      console.log(`📦 ${moreProducts.length} nouveaux produits reçus pour la page ${nextPage}`);
      
      if (moreProducts.length === 0) {
        console.log('❌ Aucun nouveau produit, fin de pagination');
        setHasMoreProducts(false);
      } else {
        console.log(`✅ Ajout de ${moreProducts.length} produits (total: ${products.length + moreProducts.length})`);
        setProducts(prev => [...prev, ...moreProducts]);
        setCurrentPage(nextPage);
        
        // Si on a moins de 50 produits, on a probablement atteint la fin
        if (moreProducts.length < 50) {
          console.log('⚠️ Moins de 50 produits reçus, probablement la fin');
          setHasMoreProducts(false);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de plus de produits:', err);
    } finally {
      setLoadingDefault(false);
    }
  };

  const handleSearch = async () => {
    // Permettre la recherche même sans mot-clé pour voir tous les produits
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
        alert('✅ Produit importé avec succès !\n\n📊 Les statistiques des fournisseurs ont été mises à jour.');
        
        // Marquer le produit comme importé visuellement
        setProducts(prev => prev.map(p => 
          p.pid === pid ? { ...p, imported: true } : p
        ));

        // Déclencher un événement personnalisé pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('cjProductImported', {
          detail: { pid, product: result.product }
        }));
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot-clé (optionnel)
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
              Catégorie
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                categoryId: e.target.value || undefined 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || category.nameEn}
                </option>
              ))}
            </select>
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
              value={filters.countryCode || 'ALL'}
              onChange={(e) => setFilters(prev => ({ ...prev, countryCode: e.target.value === 'ALL' ? undefined : e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">🌍 Tous les pays</option>
              <option value="US">🇺🇸 États-Unis</option>
              <option value="FR">🇫🇷 France</option>
              <option value="DE">🇩🇪 Allemagne</option>
              <option value="GB">🇬🇧 Royaume-Uni</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="CN">🇨🇳 Chine</option>
              <option value="IT">🇮🇹 Italie</option>
              <option value="ES">🇪🇸 Espagne</option>
              <option value="AU">🇦🇺 Australie</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleSearch}
            disabled={searching}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {searching ? 'Recherche...' : 'Rechercher'}
          </Button>
          
          <Button
            onClick={() => {
              setFilters(prev => ({ ...prev, keyword: '', minPrice: undefined, maxPrice: undefined, categoryId: undefined }));
              handleSearch();
            }}
            disabled={searching}
            variant="outline"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {searching ? 'Chargement...' : 'Voir tous les produits'}
          </Button>
          
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
          >
            {syncing ? 'Synchronisation...' : 'Synchroniser les produits'}
          </Button>

          <Button
            onClick={async () => {
              try {
                await syncCategories();
                const categoriesData = await getCategories();
                setCategories(categoriesData);
                alert('Catégories synchronisées avec succès !');
              } catch (error) {
                alert('Erreur lors de la synchronisation des catégories');
              }
            }}
            disabled={loadingCategories}
            variant="outline"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loadingCategories ? 'Synchronisation...' : 'Synchroniser les catégories'}
          </Button>
        </div>
      </Card>

      {/* Résultats de recherche */}
      {products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Résultats ({products.length} produits trouvés) - Page {currentPage}
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
          
          {/* Bouton Charger plus */}
          {hasMoreProducts && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadMoreProducts}
                disabled={loadingDefault}
                variant="outline"
                className="px-8 py-2"
              >
                {loadingDefault ? 'Chargement...' : 'Charger plus de produits'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Message si aucun résultat */}
      {products.length === 0 && !searching && !loadingDefault && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
            <p>Utilisez les filtres ci-dessus pour rechercher des produits CJ Dropshipping</p>
          </div>
        </Card>
      )}

      {/* Indicateur de chargement des produits par défaut */}
      {loadingDefault && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Chargement des produits CJ...</h3>
            <p>Récupération des produits populaires depuis CJ Dropshipping</p>
          </div>
        </Card>
      )}
    </div>
  );
}

