import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockSuppliersService {
  private readonly logger = new Logger(MockSuppliersService.name);

  // Simulation de données de fournisseurs pour les tests
  private mockSuppliers = [
    {
      id: 'supplier-1',
      name: 'Fashion Supplier Pro',
      apiUrl: 'https://api.fashionsupplier.com/v1',
      type: 'dropshipping',
      status: 'active',
      settings: {
        priceMarkup: 30,
        stockThreshold: 5,
        autoSync: true,
        syncInterval: 24
      }
    },
    {
      id: 'supplier-2', 
      name: 'Tech Gadgets Inc',
      apiUrl: 'https://api.techgadgets.com/products',
      type: 'wholesale',
      status: 'active',
      settings: {
        priceMarkup: 25,
        stockThreshold: 10,
        autoSync: false,
        syncInterval: 48
      }
    },
    {
      id: 'supplier-3',
      name: 'Home & Garden Plus',
      apiUrl: 'https://api.homegarden.com/catalog',
      type: 'marketplace',
      status: 'pending',
      settings: {
        priceMarkup: 35,
        stockThreshold: 3,
        autoSync: true,
        syncInterval: 12
      }
    }
  ];

  // Simulation de produits mock
  private mockProducts = [
    {
      sku: 'FSH-001',
      name: 'T-shirt Coton Bio Premium',
      description: 'T-shirt en coton 100% biologique, coupe moderne et confortable',
      price: 19.99,
      image: 'https://example.com/tshirt-bio.jpg',
      images: [
        'https://example.com/tshirt-bio-1.jpg',
        'https://example.com/tshirt-bio-2.jpg',
        'https://example.com/tshirt-bio-3.jpg'
      ],
      categoryId: 'clx01z000000008l20000000',
      brand: 'EcoWear',
      stock: 150,
      weight: 0.25,
      dimensions: { length: 30, width: 25, height: 2 },
      attributes: { 
        color: 'white', 
        size: 'M',
        material: 'cotton',
        origin: 'France'
      }
    },
    {
      sku: 'TECH-002',
      name: 'Casque Bluetooth Noise Cancelling',
      description: 'Casque sans fil avec réduction de bruit active, autonomie 30h',
      price: 89.99,
      image: 'https://example.com/casque-bluetooth.jpg',
      images: [
        'https://example.com/casque-bluetooth-1.jpg',
        'https://example.com/casque-bluetooth-2.jpg'
      ],
      categoryId: 'clx01z000000008l20000001',
      brand: 'SoundMax',
      stock: 75,
      weight: 0.4,
      dimensions: { length: 20, width: 18, height: 8 },
      attributes: { 
        color: 'black',
        connectivity: 'bluetooth',
        battery: '30h'
      }
    },
    {
      sku: 'HOME-003',
      name: 'Lampadaire LED Moderne',
      description: 'Lampadaire design avec éclairage LED réglable, style scandinave',
      price: 129.99,
      image: 'https://example.com/lampadaire-led.jpg',
      images: [
        'https://example.com/lampadaire-led-1.jpg',
        'https://example.com/lampadaire-led-2.jpg',
        'https://example.com/lampadaire-led-3.jpg'
      ],
      categoryId: 'clx01z000000008l20000002',
      brand: 'LightDesign',
      stock: 45,
      weight: 2.5,
      dimensions: { length: 40, width: 40, height: 160 },
      attributes: { 
        color: 'white',
        material: 'metal',
        height: '160cm',
        power: '15W'
      }
    }
  ];

  async getMockSuppliers() {
    this.logger.log('Retour des fournisseurs mock');
    return this.mockSuppliers;
  }

  async getMockProducts(supplierId?: string) {
    this.logger.log(`Retour des produits mock pour le fournisseur: ${supplierId || 'tous'}`);
    
    if (supplierId) {
      // Simuler des produits spécifiques par fournisseur
      return this.mockProducts.map(product => ({
        ...product,
        supplierId,
        // Ajouter des variations selon le fournisseur
        price: supplierId === 'supplier-1' ? product.price * 0.9 : 
               supplierId === 'supplier-2' ? product.price * 1.1 : product.price
      }));
    }
    
    return this.mockProducts;
  }

  async simulateApiCall(supplierId: string): Promise<any[]> {
    this.logger.log(`Simulation d'appel API pour le fournisseur: ${supplierId}`);
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simuler parfois des erreurs (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error(`Erreur de connexion API pour ${supplierId}`);
    }
    
    return this.getMockProducts(supplierId);
  }

  async testConnection(supplierId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Test de connexion pour le fournisseur: ${supplierId}`);
    
    // Simuler un test de connexion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 90% de chance de succès
    if (Math.random() < 0.9) {
      return { success: true, message: 'Connexion réussie' };
    } else {
      return { success: false, message: 'Échec de la connexion' };
    }
  }

  // Méthode pour ajouter de nouveaux produits mock
  async addMockProduct(product: any) {
    this.mockProducts.push({
      ...product,
      sku: `MOCK-${Date.now()}`,
      stock: Math.floor(Math.random() * 100) + 10,
      price: Math.floor(Math.random() * 100) + 10
    });
    
    this.logger.log(`Nouveau produit mock ajouté: ${product.name}`);
    return this.mockProducts[this.mockProducts.length - 1];
  }

  // Méthode pour simuler la synchronisation
  async simulateSync(supplierId: string): Promise<{
    success: boolean;
    productsAdded: number;
    productsUpdated: number;
    productsSkipped: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const result = {
      success: true,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      errors: [] as string[],
      duration: 0
    };

    try {
      this.logger.log(`Début de la synchronisation pour: ${supplierId}`);
      
      const products = await this.simulateApiCall(supplierId);
      
      // Simuler le traitement des produits
      for (const product of products) {
        // 80% de chance d'ajout, 15% de mise à jour, 5% d'erreur
        const rand = Math.random();
        if (rand < 0.8) {
          result.productsAdded++;
        } else if (rand < 0.95) {
          result.productsUpdated++;
        } else {
          result.productsSkipped++;
          result.errors.push(`Erreur de traitement pour ${product.sku}`);
        }
      }
      
      result.duration = Date.now() - startTime;
      this.logger.log(`Synchronisation terminée: ${result.productsAdded} ajoutés, ${result.productsUpdated} mis à jour`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Erreur de synchronisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }
}
