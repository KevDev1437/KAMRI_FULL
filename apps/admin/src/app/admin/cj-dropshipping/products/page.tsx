'use client';

import { ProductDetailsModal } from '@/components/cj/ProductDetailsModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/ToastContext';
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
    testConnection,
    syncFavorites,
    getProductDetails,
  } = useCJDropshipping();

  const [products, setProducts] = useState<CJProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<CJProductSearchFilters>({
    pageNum: 1,
    pageSize: 100, // 100 produits par page (limite API CJ augmentée à 200)
    searchType: 0, // 0=Tous les produits
    sort: 'desc',
    orderBy: 'createAt',
    // Paramètres legacy pour compatibilité
    keyword: '',
    minPrice: undefined,
    maxPrice: undefined,
    countryCode: 'US',
    sortBy: 'relevance',
    categoryId: undefined,
  });
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // États pour la sélection multiple
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkImporting, setBulkImporting] = useState(false);
  const [showBulkMapping, setShowBulkMapping] = useState(false);
  const [selectedKamriCategory, setSelectedKamriCategory] = useState<string>('');
  
  // États pour le modal de détails
  const [selectedProduct, setSelectedProduct] = useState<CJProduct | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [pidSearch, setPidSearch] = useState('');
  const [loadingPidSearch, setLoadingPidSearch] = useState(false);
  const [pidProduct, setPidProduct] = useState<CJProduct | null>(null);
  const [importingPid, setImportingPid] = useState(false);
  const toast = useToast();

  // Charger les catégories et produits lors de la connexion
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingCategories(true);
      setLoadingDefault(true);
      try {
        // Tester la connexion et charger les données simultanément
        const connectionResult = await testConnection();
        
        if (connectionResult.success) {
          // Utiliser les catégories et produits de la connexion
          if (connectionResult.categories) {
            setCategories(Array.isArray(connectionResult.categories) ? connectionResult.categories : []);
            console.log('Catégories chargées via connexion:', connectionResult.categoriesCount);
          }
          
          if (connectionResult.products) {
            setProducts(Array.isArray(connectionResult.products) ? connectionResult.products : []);
            console.log('Produits chargés via connexion:', connectionResult.productsCount);
          }
        } else {
          // En cas d'échec, charger séparément (fallback)
          console.log('Connexion échouée, chargement séparé...');
          const categoriesData = await getCategories();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          
          const defaultProducts = await getDefaultProducts({
            pageNum: 1,
            pageSize: 50,
            countryCode: 'US'
          });
          setProducts(Array.isArray(defaultProducts) ? defaultProducts : []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingDefault(false);
      }
    };

    loadInitialData();
  }, []);

  // L'ancien useEffect pour charger les produits par défaut est maintenant intégré dans loadInitialData

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
        // 🔧 CORRECTION : Éviter les doublons en filtrant les PIDs existants
        const existingPids = new Set(products.map(p => p.pid));
        const newProducts = moreProducts.filter(p => !existingPids.has(p.pid));
        
        console.log(`📦 ${moreProducts.length} produits reçus, ${newProducts.length} nouveaux (${moreProducts.length - newProducts.length} doublons filtrés)`);
        
        if (newProducts.length > 0) {
          setProducts(prev => [...prev, ...newProducts]);
          setCurrentPage(nextPage);
        } else {
          console.log('⚠️ Tous les produits sont des doublons, fin de pagination');
          setHasMoreProducts(false);
        }
        
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
        toast.showToast({ type: 'success', title: 'Import', description: '✅ Produit importé avec succès !\n\n📊 Les statistiques des fournisseurs ont été mises à jour.' });
        
        // Marquer le produit comme importé visuellement
        setProducts(prev => prev.map(p => 
          p.pid === pid ? { ...p, imported: true } : p
        ));

        // Déclencher un événement personnalisé pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('cjProductImported', {
          detail: { pid, product: result.product }
        }));
        
        // Rafraîchir les notifications du header
        window.dispatchEvent(new Event('refreshStoreNotifications'));
      } else {
        toast.showToast({ type: 'error', title: 'Import', description: `❌ ${result.message}` });
      }
    } catch (err) {
      toast.showToast({ type: 'error', title: 'Import', description: '❌ Erreur lors de l\'import du produit' });
    } finally {
      setImporting(null);
    }
  };

  // Fonctions pour la sélection multiple
  const toggleProductSelection = (pid: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pid)) {
        newSet.delete(pid);
      } else {
        newSet.add(pid);
      }
      return newSet;
    });
  };

  const selectAllProducts = () => {
    setSelectedProducts(new Set(products.map(p => p.pid)));
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleBulkImport = async () => {
    if (selectedProducts.size === 0) {
      toast.showToast({ type: 'warning', title: 'Import en lot', description: '❌ Veuillez sélectionner au moins un produit' });
      return;
    }

    if (!selectedKamriCategory) {
      toast.showToast({ type: 'warning', title: 'Import en lot', description: '❌ Veuillez sélectionner une catégorie KAMRI' });
      return;
    }

    setBulkImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const pid of Array.from(selectedProducts)) {
        try {
          await importProduct(pid, selectedKamriCategory, 2.5);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Erreur import produit ${pid}:`, error);
        }
      }

  toast.showToast({ type: 'success', title: 'Import en lot', description: `✅ Import en lot terminé !\n✅ ${successCount} produits importés\n❌ ${errorCount} erreurs` });
      
      // Marquer les produits comme importés
      setProducts(prev => prev.map(p => 
        selectedProducts.has(p.pid) ? { ...p, imported: true } : p
      ));

      // Rafraîchir les notifications du header
      if (successCount > 0) {
        window.dispatchEvent(new Event('refreshStoreNotifications'));
      }

      // Vider la sélection
      clearSelection();
      setShowBulkMapping(false);
    } catch (err) {
      toast.showToast({ type: 'error', title: 'Import en lot', description: '❌ Erreur lors de l\'import en lot' });
    } finally {
      setBulkImporting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncProducts();
      toast.showToast({ type: 'success', title: 'Synchronisation', description: `✅ Synchronisation terminée: ${result.synced} produits mis à jour, ${result.errors} erreurs` });
      
      // Rafraîchir les notifications du header si des produits ont été synchronisés
      if (result.synced > 0) {
        window.dispatchEvent(new Event('refreshStoreNotifications'));
      }
    } catch (err) {
      toast.showToast({ type: 'error', title: 'Synchronisation', description: '❌ Erreur lors de la synchronisation' });
    } finally {
      setSyncing(false);
    }
  };

  // Fonctions pour le modal de détails
  const handleShowDetails = async (product: CJProduct) => {
    try {
      setShowDetailsModal(true);
      setSelectedProduct(product); // Afficher d'abord les données de base
      setLoadingDetails(true);
      
      // Ensuite récupérer les détails complets
      const detailedProduct = await getProductDetails(product.pid);
      setSelectedProduct(detailedProduct);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      toast.showToast({ 
        title: 'Erreur', 
        description: 'Erreur lors du chargement des détails du produit',
        type: 'error' 
      });
      // Garder les données de base si l'API échoue
      setSelectedProduct(product);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  const handleImportFromModal = async (productId: string) => {
    try {
      await importProduct(productId, undefined, 2.5);
      // Fermer le modal après import
      handleCloseDetails();
      // Marquer le produit comme importé dans la liste
      setProducts(prev => prev.map(p => 
        p.pid === productId ? { ...p, imported: true } : p
      ));
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
    }
  };

  // Rechercher un produit par PID
  const handlePidSearch = async () => {
    if (!pidSearch.trim()) {
      toast.showToast({ type: 'warning', title: 'Recherche PID', description: '❌ Veuillez entrer un PID' });
      return;
    }

    setLoadingPidSearch(true);
    setPidProduct(null);
    try {
      const product = await getProductDetails(pidSearch.trim());
      setPidProduct(product);
      toast.showToast({ type: 'success', title: 'Recherche PID', description: '✅ Produit trouvé !' });
    } catch (error: any) {
      console.error('Erreur lors de la recherche par PID:', error);
      toast.showToast({ 
        type: 'error', 
        title: 'Recherche PID', 
        description: error?.response?.data?.message || '❌ Produit introuvable avec ce PID' 
      });
      setPidProduct(null);
    } finally {
      setLoadingPidSearch(false);
    }
  };

  // Importer directement par PID
  const handleImportByPid = async () => {
    if (!pidSearch.trim()) {
      toast.showToast({ type: 'warning', title: 'Import PID', description: '❌ Veuillez entrer un PID' });
      return;
    }

    setImportingPid(true);
    try {
      const result = await importProduct(pidSearch.trim());
      if (result.success) {
        toast.showToast({ type: 'success', title: 'Import PID', description: '✅ Produit importé avec succès !' });
        setPidSearch('');
        setPidProduct(null);
        // Rafraîchir les notifications
        window.dispatchEvent(new Event('refreshStoreNotifications'));
      } else {
        toast.showToast({ type: 'error', title: 'Import PID', description: `❌ ${result.message}` });
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'import par PID:', error);
      toast.showToast({ 
        type: 'error', 
        title: 'Import PID', 
        description: error?.response?.data?.message || '❌ Erreur lors de l\'import du produit' 
      });
    } finally {
      setImportingPid(false);
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

      {/* Recherche par PID */}
      <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher ou importer directement par PID
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Entrez le PID du produit (ex: 1551876795908239360)"
                value={pidSearch}
                onChange={(e) => setPidSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePidSearch();
                  }
                }}
                className="flex-1"
                disabled={loadingPidSearch || importingPid}
              />
              <Button
                onClick={handlePidSearch}
                disabled={loadingPidSearch || importingPid || !pidSearch.trim()}
                variant="outline"
              >
                {loadingPidSearch ? 'Recherche...' : 'Rechercher'}
              </Button>
              <Button
                onClick={handleImportByPid}
                disabled={importingPid || loadingPidSearch || !pidSearch.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {importingPid ? 'Import...' : 'Importer directement'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Si le produit n'apparaît pas dans la recherche, vous pouvez l'importer directement avec son PID (visible dans les webhooks)
            </p>
          </div>
        </div>

        {/* Afficher le produit trouvé par PID */}
        {pidProduct && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{pidProduct.productNameEn || pidProduct.productName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">PID:</span>
                    <span className="ml-2 font-mono text-xs">{pidProduct.pid}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 font-mono text-xs">{pidProduct.productSku}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prix:</span>
                    <span className="ml-2 font-semibold">{pidProduct.sellPrice} €</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Catégorie:</span>
                    <span className="ml-2">{pidProduct.categoryName}</span>
                  </div>
                </div>
                {pidProduct.productImage && (
                  <div className="mt-3">
                    <img 
                      src={Array.isArray(pidProduct.productImage) ? pidProduct.productImage[0] : pidProduct.productImage} 
                      alt={pidProduct.productNameEn || pidProduct.productName}
                      className="w-32 h-32 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => handleShowDetails(pidProduct)}
                  variant="outline"
                  size="sm"
                >
                  Voir détails
                </Button>
                <Button
                  onClick={handleImportByPid}
                  disabled={importingPid}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {importingPid ? 'Import...' : 'Importer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

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
                <option key={category.categoryFirstId || category.id} value={category.categoryFirstId || category.id}>
                  {category.categoryFirstName || category.name || category.nameEn}
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

        {/* Filtres avancés selon la documentation CJ */}
        <details className="mb-4">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
            🔧 Filtres avancés (selon documentation CJ)
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de produit
              </label>
              <select
                value={filters.productType || 'ALL'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  productType: e.target.value === 'ALL' ? undefined : e.target.value as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous les types</option>
                <option value="ORDINARY_PRODUCT">Produit ordinaire</option>
                <option value="SERVICE_PRODUCT">Produit de service</option>
                <option value="PACKAGING_PRODUCT">Produit d'emballage</option>
                <option value="SUPPLIER_PRODUCT">Produit fournisseur</option>
                <option value="SUPPLIER_SHIPPED_PRODUCT">Expédié par fournisseur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai de livraison
              </label>
              <select
                value={filters.deliveryTime || 'ALL'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  deliveryTime: e.target.value === 'ALL' ? undefined : e.target.value as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous les délais</option>
                <option value="24">⚡ 24 heures</option>
                <option value="48">🚀 48 heures</option>
                <option value="72">📦 72 heures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inventaire vérifié
              </label>
              <select
                value={filters.verifiedWarehouse || 'ALL'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  verifiedWarehouse: e.target.value === 'ALL' ? undefined : Number(e.target.value) as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous les inventaires</option>
                <option value="1">✅ Vérifié</option>
                <option value="2">⚠️ Non vérifié</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livraison gratuite
              </label>
              <select
                value={filters.isFreeShipping || 'ALL'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isFreeShipping: e.target.value === 'ALL' ? undefined : Number(e.target.value) as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous</option>
                <option value="1">🆓 Livraison gratuite</option>
                <option value="0">💰 Livraison payante</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock minimum
              </label>
              <Input
                type="number"
                value={filters.startInventory || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  startInventory: e.target.value ? Number(e.target.value) : undefined 
                }))}
                placeholder="ex: 10"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock maximum
              </label>
              <Input
                type="number"
                value={filters.endInventory || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  endInventory: e.target.value ? Number(e.target.value) : undefined 
                }))}
                placeholder="ex: 1000"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de recherche
              </label>
              <select
                value={filters.searchType || 0}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  searchType: Number(e.target.value) as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>🔍 Tous les produits</option>
                <option value={2}>📈 Produits tendance</option>
                <option value={21}>🔥 Plus de tendances</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support pickup
              </label>
              <select
                value={filters.isSelfPickup || 'ALL'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isSelfPickup: e.target.value === 'ALL' ? undefined : Number(e.target.value) as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tous</option>
                <option value="1">🏪 Pickup supporté</option>
                <option value="0">🚚 Livraison uniquement</option>
              </select>
            </div>

          </div>
        </details>

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
                toast.showToast({ type: 'success', title: 'Catégories', description: 'Catégories synchronisées avec succès !' });
              } catch (error) {
                toast.showToast({ type: 'error', title: 'Catégories', description: 'Erreur lors de la synchronisation des catégories' });
              }
            }}
            disabled={loadingCategories}
            variant="outline"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loadingCategories ? 'Synchronisation...' : 'Synchroniser les catégories'}
          </Button>

          <Button
            onClick={async () => {
              try {
                setSyncing(true);
                const result = await syncFavorites();
                toast.showToast({ type: 'success', title: 'Favoris', description: `✅ ${result.message}` });
                if (result.synced > 0) {
                  // Recharger les produits après synchronisation (remplacer au lieu d'ajouter)
                  const defaultProducts = await getDefaultProducts({
                    pageNum: 1,
                    pageSize: 100,
                    countryCode: 'US'
                  });
                  setProducts(Array.isArray(defaultProducts) ? defaultProducts : []);
                  setCurrentPage(1); // Reset pagination
                  setHasMoreProducts(true); // Réinitialiser la pagination
                  
                  // Rafraîchir les notifications du header
                  window.dispatchEvent(new Event('refreshStoreNotifications'));
                }
              } catch (error) {
                toast.showToast({ type: 'error', title: 'Favoris', description: '❌ Erreur lors de la synchronisation des favoris' });
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {syncing ? 'Synchronisation...' : 'Synchroniser les favoris CJ'}
          </Button>
        </div>
      </Card>

      {/* Résultats de recherche */}
      {products.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Résultats ({products.length} produits trouvés) - Page {currentPage}
            </h2>
            
            {/* Contrôles de sélection multiple */}
            <div className="flex gap-2">
              <Button
                onClick={selectAllProducts}
                variant="outline"
                size="sm"
                disabled={selectedProducts.size === products.length}
              >
                Tout sélectionner
              </Button>
              
              <Button
                onClick={clearSelection}
                variant="outline"
                size="sm"
                disabled={selectedProducts.size === 0}
              >
                Désélectionner tout
              </Button>
              
              {selectedProducts.size > 0 && (
                <Button
                  onClick={() => setShowBulkMapping(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Importer sélection ({selectedProducts.size})
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card key={`${product.pid}-${index}`} className="overflow-hidden relative">
                {/* Checkbox de sélection */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.pid)}
                    onChange={() => toggleProductSelection(product.pid)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="aspect-square bg-gray-100">
                  <img
                    src={(() => {
                      // Gérer les images CJ qui peuvent être un tableau ou une string
                      let imageUrl = product.productImage;
                      
                      // 🔧 CORRECTION : Vérifier d'abord si c'est un array
                      if (Array.isArray(imageUrl)) {
                        imageUrl = imageUrl[0];
                        console.log('📸 Tableau d\'images détecté, utilisation de la première:', imageUrl);
                      }
                      // Si c'est une string qui contient un tableau JSON
                      else if (typeof imageUrl === 'string' && imageUrl.includes('[')) {
                        try {
                          const parsed = JSON.parse(imageUrl);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            imageUrl = parsed[0];
                            console.log('📸 JSON d\'images parsé, utilisation de la première:', imageUrl);
                          }
                        } catch (e) {
                          console.warn('Erreur parsing JSON image:', e);
                        }
                      }
                      
                      // Vérifier que l'URL est valide
                      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                        console.warn('Image invalide détectée:', product.productImage);
                        return '/placeholder-product.jpg';
                      }
                      
                      return imageUrl;
                    })()}
                    alt={product.productNameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Erreur de chargement d\'image:', product.productImage);
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
                        ${(() => {
                          // sellPrice peut être string ou number selon l'API CJ
                          const priceStr = String(product.sellPrice || '');
                          if (!priceStr) return '0.00';
                          
                          // Gérer les plages de prix (ex: "11.00 -- 11.87")
                          if (priceStr.includes('--')) {
                            const [minPrice] = priceStr.split('--').map(p => parseFloat(p.trim()));
                            return isNaN(minPrice) ? '0.00' : minPrice.toFixed(2);
                          }
                          
                          // Prix simple
                          const price = parseFloat(priceStr);
                          return isNaN(price) ? '0.00' : price.toFixed(2);
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">SKU</span>
                      <span className="text-sm font-mono">{product.productSku}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock</span>
                      <span className="text-sm">
                        {(() => {
                          // Le stock n'est disponible qu'après import selon l'API CJ
                          return 'Stock après import';
                        })()}
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
                      onClick={() => handleShowDetails(product)}
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

      {/* Modal de mapping en lot */}
      {showBulkMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Importer {selectedProducts.size} produits
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie KAMRI de destination
              </label>
              <select
                value={selectedKamriCategory}
                onChange={(e) => setSelectedKamriCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie...</option>
                {categories.map((category) => (
                  <option key={category.categoryFirstId || category.id} value={category.categoryFirstId || category.id}>
                    {category.categoryFirstName || category.name || category.nameEn}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowBulkMapping(false);
                  setSelectedKamriCategory('');
                }}
                variant="outline"
              >
                Annuler
              </Button>
              
              <Button
                onClick={handleBulkImport}
                disabled={bulkImporting || !selectedKamriCategory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bulkImporting ? 'Import en cours...' : 'Importer'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de détails du produit */}
      <ProductDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        product={selectedProduct}
        onImport={handleImportFromModal}
        importing={importing === selectedProduct?.pid}
      />
    </div>
  );
}

