'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Store {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  stats: {
    total: number;
    available: number;
    imported: number;
    selected: number;
    pending: number;
  };
  lastSync: string | null;
  config: {
    email: string;
    tier: string;
    enabled: boolean;
  };
}

interface StoreProduct {
  id: string;
  cjProductId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore);
    }
  }, [selectedStore, searchTerm, statusFilter, categoryFilter]);

  const fetchStores = async () => {
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Aucun token d\'authentification trouvé');
        setStores([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Données reçues du serveur:', data);
      
      // Vérifier que data est un tableau
      if (Array.isArray(data)) {
        setStores(data);
      } else {
        console.error('❌ Les données ne sont pas un tableau:', data);
        setStores([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async (storeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`http://localhost:3001/api/stores/${storeId}/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const toggleProductSelection = async (storeId: string, productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`http://localhost:3001/api/stores/${storeId}/products/${productId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchStoreProducts(storeId);
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
    }
  };

  const importSelectedProducts = async (storeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/stores/${storeId}/import-selected`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      alert(data.message);
      fetchStoreProducts(storeId);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'selected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'imported':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary">Disponible</Badge>;
      case 'selected':
        return <Badge variant="default">Sélectionné</Badge>;
      case 'imported':
        return <Badge variant="outline">Importé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des magasins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Magasins</h1>
        <p className="text-muted-foreground">
          Gérez vos magasins de produits et importez en lot
        </p>
      </div>

      {/* Liste des magasins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(stores) && stores.map((store) => (
          <Card key={store.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {store.name}
                </CardTitle>
                <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                  {store.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <CardDescription>{store.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">{store.stats.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disponibles</p>
                    <p className="font-semibold text-blue-600">{store.stats.available}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sélectionnés</p>
                    <p className="font-semibold text-green-600">{store.stats.selected}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Importés</p>
                    <p className="font-semibold text-purple-600">{store.stats.imported}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedStore(store.id)}
                  className="w-full"
                >
                  Voir les produits
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {Array.isArray(stores) && stores.length === 0 && (
          <div className="col-span-full text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun magasin disponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              Assurez-vous que CJ Dropshipping est configuré et activé
            </p>
          </div>
        )}
      </div>

      {/* Produits du magasin sélectionné */}
      {selectedStore && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Produits - {stores.find(s => s.id === selectedStore)?.name}
                </CardTitle>
                <CardDescription>
                  Sélectionnez les produits à importer
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => importSelectedProducts(selectedStore)}
                  variant="default"
                >
                  Importer les sélectionnés
                </Button>
                <Button 
                  onClick={() => setSelectedStore(null)}
                  variant="outline"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtres */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="selected">Sélectionnés</SelectItem>
                  <SelectItem value="imported">Importés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Liste des produits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(product.status)}
                        {getStatusBadge(product.status)}
                      </div>
                      <Button
                        size="sm"
                        variant={product.status === 'selected' ? 'default' : 'outline'}
                        onClick={() => toggleProductSelection(selectedStore, product.id)}
                        disabled={product.status === 'imported'}
                      >
                        {product.status === 'selected' ? 'Désélectionner' : 'Sélectionner'}
                      </Button>
                    </div>
                    
                    {product.image && (
                      <img 
                        src={Array.isArray(product.image) ? product.image[0] : product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                        onError={(e) => {
                          console.log('❌ Erreur de chargement d\'image:', e.currentTarget.src);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Prix: <span className="font-semibold text-foreground">${product.price}</span></p>
                      <p>Catégorie: {product.category}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun produit trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
