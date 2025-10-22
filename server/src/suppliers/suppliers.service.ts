import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        ...createSupplierDto,
        apiKey: createSupplierDto.apiKey || '', // Valeur par défaut si pas fournie
      },
    });
  }

  async findAll() {
    // Récupérer les fournisseurs normaux
    const normalSuppliers = await this.prisma.supplier.findMany({
      include: {
        products: true,
        categoryMappings: true,
      },
    });

    // Vérifier si CJ Dropshipping est configuré
    const cjConfig = await this.prisma.cJConfig.findFirst();
    
    if (cjConfig && cjConfig.enabled) {
      // Récupérer les statistiques du magasin CJ
      const cjStoreStats = await this.getCJStoreStats();
      
      // ✅ Récupérer les produits RÉELLEMENT importés dans KAMRI (pas dans le magasin)
      const cjSupplierInDb = await this.prisma.supplier.findFirst({
        where: { name: 'CJ Dropshipping' }
      });

      const importedProducts = cjSupplierInDb ? await this.prisma.product.findMany({
        where: { 
          source: 'cj-dropshipping',
          supplierId: cjSupplierInDb.id // ✅ Vrai fournisseur CJ
        },
        include: {
          category: true,
          supplier: true
        }
      }) : [];
      
      const cjLastSync = await this.prisma.cJProductStore.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      // Créer un fournisseur virtuel CJ
      const cjSupplierVirtual = {
        id: 'cj-dropshipping',
        name: 'CJ Dropshipping',
        description: 'Dropshipping depuis CJ',
        apiUrl: 'https://developers.cjdropshipping.com',
        apiKey: cjConfig.apiKey ? '***' : '',
        status: cjConfig.enabled ? 'connected' : 'disconnected',
        lastSync: cjLastSync?.createdAt || null,
        products: importedProducts, // ✅ Vrais produits importés dans KAMRI
        categoryMappings: [],
        isVirtual: true, // Marquer comme fournisseur virtuel
        cjConfig: cjConfig,
        storeStats: cjStoreStats // ✅ Statistiques du magasin (pour info)
      };

      // Ajouter CJ à la liste des fournisseurs
      return [...normalSuppliers, cjSupplierVirtual];
    }

    return normalSuppliers;
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        categoryMappings: true,
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async testConnection(id: string) {
    // Gestion spéciale pour CJ Dropshipping
    if (id === 'cj-dropshipping') {
      const cjConfig = await this.prisma.cJConfig.findFirst();
      if (!cjConfig) {
        return { success: false, message: 'CJ Dropshipping non configuré' };
      }

      // Tester la connexion CJ via le service CJ
      try {
        // Import du service CJ (éviter la dépendance circulaire)
        const { CJDropshippingService } = await import('../cj-dropshipping/cj-dropshipping.service');
        const { CJAPIClient } = await import('../cj-dropshipping/cj-api-client');
        const cjApiClient = new CJAPIClient({} as any);
        const cjService = new CJDropshippingService(this.prisma, cjApiClient);
        const result = await cjService.testConnection();
        
        return result;
      } catch (error) {
        return { success: false, message: `Erreur CJ: ${error instanceof Error ? error.message : String(error)}` };
      }
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new Error('Fournisseur non trouvé');
    }

    // Simulation du test de connexion
    const isConnected = Math.random() > 0.3; // 70% de chance de succès

    if (isConnected) {
      await this.prisma.supplier.update({
        where: { id },
        data: {
          status: 'connected',
          lastSync: new Date(),
        },
      });
      return { success: true, message: 'Connexion réussie' };
    } else {
      await this.prisma.supplier.update({
        where: { id },
        data: { status: 'disconnected' },
      });
      return { success: false, message: 'Échec de la connexion' };
    }
  }

  async getStats() {
    const total = await this.prisma.supplier.count();
    const connected = await this.prisma.supplier.count({
      where: { status: 'connected' },
    });
    const products = await this.prisma.product.count({
      where: { supplierId: { not: null } },
    });

    return {
      total,
      connected,
      disconnected: total - connected,
      products,
    };
  }

  async importProducts(supplierId: string) {
    console.log('🚀 === DÉBUT IMPORT PRODUITS ===');
    console.log('🔍 Supplier ID:', supplierId);
    
    // Gestion spéciale pour CJ Dropshipping - Import en lot depuis le magasin
    if (supplierId === 'cj-dropshipping') {
      try {
        console.log('🛒 === IMPORT EN LOT DEPUIS LE MAGASIN CJ ===');
        
        // Récupérer tous les produits disponibles du magasin CJ
        const cjStoreProducts = await this.prisma.cJProductStore.findMany({
          where: { status: 'available' },
          orderBy: { createdAt: 'desc' }
        });

        // ✅ DEBUG : Vérifier tous les produits du magasin
        const allCJProducts = await this.prisma.cJProductStore.findMany({
          orderBy: { createdAt: 'desc' }
        });
        console.log(`🔍 DEBUG - Tous les produits du magasin CJ:`, allCJProducts.map(p => ({ 
          id: p.id, 
          name: p.name, 
          status: p.status 
        })));

        if (cjStoreProducts.length === 0) {
          // ✅ Si aucun produit disponible, mais qu'il y a des produits importés, les remettre en disponible
          const importedProducts = allCJProducts.filter(p => p.status === 'imported');
          if (importedProducts.length > 0) {
            console.log(`🔄 Remise en statut 'available' de ${importedProducts.length} produits importés`);
            await this.prisma.cJProductStore.updateMany({
              where: { status: 'imported' },
              data: { status: 'available' }
            });
            
            // Récupérer à nouveau les produits maintenant disponibles
            const newCJStoreProducts = await this.prisma.cJProductStore.findMany({
              where: { status: 'available' },
              orderBy: { createdAt: 'desc' }
            });
            
            if (newCJStoreProducts.length > 0) {
              console.log(`✅ ${newCJStoreProducts.length} produits remis en statut 'available'`);
              // Continuer avec l'import
              cjStoreProducts.push(...newCJStoreProducts);
            }
          }
          
          if (cjStoreProducts.length === 0) {
            return {
              message: `Aucun produit disponible dans le magasin CJ (${allCJProducts.length} produits au total, statuts: ${allCJProducts.map(p => p.status).join(', ')})`,
              products: [],
              supplier: 'CJ Dropshipping',
              workflow: 'Magasin vide - Importez d\'abord des produits depuis /admin/cj-dropshipping/products'
            };
          }
        }

        console.log(`📦 ${cjStoreProducts.length} produits trouvés dans le magasin CJ`);
        
        const importedProducts = [];
        
        for (const cjProduct of cjStoreProducts) {
          try {
            console.log(`\n🔄 === TRAITEMENT PRODUIT MAGASIN ===`);
            console.log(`📝 Nom: ${cjProduct.name}`);
            console.log(`🏷️ Catégorie: ${cjProduct.category}`);
            console.log(`💰 Prix: ${cjProduct.price}`);
            
            // Mapper les catégories externes vers nos catégories
            const categoryId = await this.mapExternalCategory(cjProduct.category || '', 'cj-dropshipping');
            console.log(`✅ Catégorie mappée vers ID: ${categoryId}`);
            
            // ✅ Créer un vrai fournisseur CJ s'il n'existe pas
            let cjSupplier = await this.prisma.supplier.findFirst({
              where: { name: 'CJ Dropshipping' }
            });

            if (!cjSupplier) {
              console.log('🏢 Création du fournisseur CJ Dropshipping...');
              cjSupplier = await this.prisma.supplier.create({
                data: {
                  name: 'CJ Dropshipping',
                  description: 'Fournisseur CJ Dropshipping pour vente réelle',
                  apiUrl: 'https://developers.cjdropshipping.com',
                  apiKey: 'cj-api-key',
                  status: 'connected',
                  lastSync: new Date(),
                }
              });
              console.log(`✅ Fournisseur CJ créé avec ID: ${cjSupplier.id}`);
            }

            // Créer le produit KAMRI (comme les produits statiques)
            const productData: any = {
              name: cjProduct.name,
              description: cjProduct.description,
              price: cjProduct.price,
              originalPrice: cjProduct.originalPrice,
              image: cjProduct.image,
              supplierId: cjSupplier.id, // ✅ Vrai fournisseur CJ
              externalCategory: cjProduct.category,
              source: 'cj-dropshipping',
              status: 'pending', // En attente de validation
              badge: this.generateBadge(),
              stock: Math.floor(Math.random() * 50) + 10,
            };

            // Ajouter categoryId seulement si une catégorie est assignée
            if (categoryId) {
              productData.categoryId = categoryId;
            }

            const product = await this.prisma.product.create({
              data: productData,
              include: {
                category: true,
                supplier: true,
              },
            });

            // Marquer le produit comme importé dans le magasin
            await this.prisma.cJProductStore.update({
              where: { id: cjProduct.id },
              data: { status: 'imported' }
            });

            // Créer le mapping CJ
            await this.prisma.cJProductMapping.create({
              data: {
                productId: product.id,
                cjProductId: cjProduct.cjProductId,
                cjSku: cjProduct.cjProductId, // Utiliser cjProductId comme SKU
                lastSyncAt: new Date(),
              },
            });
            
            console.log(`✅ Produit KAMRI créé: ${product.name} (statut: pending)`);
            console.log(`📊 ID produit: ${product.id}`);
            importedProducts.push(product);
          } catch (error) {
            console.error(`❌ Erreur lors de la création du produit ${cjProduct.name}:`, error);
          }
        }

        console.log(`\n🎉 === IMPORT EN LOT TERMINÉ ===`);
        console.log(`📊 Total produits importés: ${importedProducts.length}`);
        console.log(`🏢 Fournisseur: CJ Dropshipping`);
        console.log(`📋 Produits:`, importedProducts.map(p => ({ name: p.name, category: p.category?.name, status: p.status })));

        return {
          message: `${importedProducts.length} produits importés depuis le magasin CJ - Tous en attente de validation`,
          products: importedProducts,
          supplier: 'CJ Dropshipping',
          workflow: 'Magasin CJ → Import en lot → Validation → Active'
        };
      } catch (error) {
        console.log('❌ === ERREUR IMPORT MAGASIN CJ ===');
        console.log('💥 Erreur:', error);
        throw new Error(`Erreur lors de l'import du magasin CJ: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      console.log('❌ Fournisseur non trouvé pour ID:', supplierId);
      throw new Error('Fournisseur non trouvé');
    }

    console.log('✅ Fournisseur trouvé:', supplier.name);

    try {
      // Utiliser les données stockées dans la base de données
      const apiUrl = supplier.apiUrl;
      const apiName = supplier.name; // Ou un champ apiName si tu en ajoutes un
      
      console.log(`🔄 Début de l'import depuis ${apiName}...`);
      console.log(`🌐 URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.log('❌ Erreur HTTP:', response.status, response.statusText);
        throw new Error('Erreur lors de la récupération des produits');
      }
      
      const apiResponse = await response.json();
      
      // DummyJSON retourne { products: [...] } alors que Fake Store retourne directement [...]
      const fakeProducts = apiResponse.products || apiResponse;
      
      console.log(`📦 ${fakeProducts.length} produits récupérés depuis ${apiName}`);
      console.log('📋 Premiers produits:', fakeProducts.slice(0, 3).map(p => ({ title: p.title, category: p.category })));
      
      const importedProducts = [];
      
      for (const fakeProduct of fakeProducts) {
        try {
          console.log(`\n🔄 === TRAITEMENT PRODUIT ===`);
          console.log(`📝 Titre: ${fakeProduct.title}`);
          console.log(`🏷️ Catégorie externe: "${fakeProduct.category}"`);
          console.log(`💰 Prix: ${fakeProduct.price}`);
          
          // Debug des images
          const extractedImage = this.extractImageUrl(fakeProduct);
          console.log(`🖼️ Image extraite: ${extractedImage || 'Aucune image trouvée'}`);
          if (fakeProduct.images) console.log(`📸 Images disponibles: ${fakeProduct.images.length}`);
          if (fakeProduct.image) console.log(`🖼️ Image directe: ${fakeProduct.image}`);
          if (fakeProduct.thumbnail) console.log(`🔍 Thumbnail: ${fakeProduct.thumbnail}`);
          
          // Mapper les catégories externes vers nos catégories
          const categoryId = await this.mapExternalCategory(fakeProduct.category, supplier.id);
          console.log(`✅ Catégorie mappée vers ID: ${categoryId}`);
          
          // TOUS les produits importés sont en attente de catégorisation et validation
          const productData: any = {
            name: fakeProduct.title,
            description: fakeProduct.description,
            price: fakeProduct.price,
            originalPrice: fakeProduct.price * 1.2, // Prix original fictif
            image: this.extractImageUrl(fakeProduct), // ✅ Fonction générique pour tous les fournisseurs
            supplierId: supplier.id,
            externalCategory: fakeProduct.category, // Sauvegarder la catégorie externe
            source: 'dummy-json', // ✅ Marquer la source
            status: 'pending', // TOUS les produits en attente de catégorisation
            badge: this.generateBadge(),
            stock: Math.floor(Math.random() * 50) + 10,
          };

          // Ajouter categoryId seulement si une catégorie est assignée
          if (categoryId) {
            productData.categoryId = categoryId;
          }

          const product = await this.prisma.product.create({
            data: productData,
            include: {
              category: true,
              supplier: true,
            },
          });
          
          // Sauvegarder toutes les images du produit
          const allImages = this.extractAllImages(fakeProduct);
          if (allImages.length > 0) {
            console.log(`🖼️ Sauvegarde de ${allImages.length} images pour le produit`);
            for (const imageUrl of allImages) {
              await this.prisma.image.create({
                data: {
                  url: imageUrl,
                  alt: fakeProduct.title,
                  productId: product.id,
                },
              });
            }
          }
          
          console.log(`✅ Produit créé: ${product.name} (statut: pending - en attente de catégorisation)`);
          console.log(`📊 ID produit: ${product.id}`);
          console.log(`🖼️ Images sauvegardées: ${allImages.length}`);
          importedProducts.push(product);
        } catch (error) {
          console.error(`❌ Erreur lors de la création du produit ${fakeProduct.title}:`, error);
        }
      }

      console.log(`\n🎉 === IMPORT TERMINÉ ===`);
      console.log(`📊 Total produits importés: ${importedProducts.length}`);
      console.log(`🏢 Fournisseur: ${supplier.name}`);
      console.log(`📋 Produits:`, importedProducts.map(p => ({ name: p.name, category: p.category?.name, status: p.status })));

      return {
        message: `${importedProducts.length} produits importés depuis ${apiName} - Tous en attente de catégorisation`,
        products: importedProducts,
        supplier: supplier.name,
        workflow: 'Import → Catégorisation → Validation → Active'
      };
    } catch (error) {
      console.log('❌ === ERREUR IMPORT ===');
      console.log('💥 Erreur:', error);
      throw new Error(`Erreur lors de l'import: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async mapExternalCategory(fakeCategory: string, supplierId: string): Promise<string> {
    console.log(`\n🔍 === MAPPING CATÉGORIE ===`);
    console.log(`🏷️ Catégorie externe: "${fakeCategory}"`);
    console.log(`🏢 Supplier ID: ${supplierId}`);
    
    // Vérifier s'il existe déjà un mapping pour cette catégorie externe
    console.log(`🔎 Recherche mapping existant...`);
    const existingMapping = await this.prisma.categoryMapping.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });

    if (existingMapping) {
      console.log(`✅ Mapping existant trouvé:`, existingMapping);
      // Trouver la catégorie interne correspondante
      const internalCategory = await this.prisma.category.findFirst({
        where: { name: existingMapping.internalCategory }
      });
      
      if (internalCategory) {
        console.log(`✅ Catégorie interne trouvée: ${internalCategory.name} (ID: ${internalCategory.id})`);
        return internalCategory.id;
      }
    } else {
      console.log(`❌ Aucun mapping existant pour "${fakeCategory}"`);
    }

    // Si pas de mapping, enregistrer comme catégorie non mappée
    console.log(`📝 Enregistrement catégorie non mappée...`);
    try {
      // ✅ Pour CJ, utiliser le vrai supplierId
      let actualSupplierId = supplierId;
      if (supplierId === 'cj-dropshipping') {
        const cjSupplier = await this.prisma.supplier.findFirst({
          where: { name: 'CJ Dropshipping' }
        });
        actualSupplierId = cjSupplier?.id || null;
      }
      
      if (actualSupplierId) {
        await this.prisma.unmappedExternalCategory.upsert({
          where: {
            supplierId_externalCategory: {
              supplierId: actualSupplierId,
              externalCategory: fakeCategory
            }
          },
          update: {
            productCount: {
              increment: 1
            }
          },
          create: {
            externalCategory: fakeCategory,
            supplierId: actualSupplierId,
            productCount: 1
          }
        });
        console.log(`✅ Catégorie non mappée enregistrée: ${fakeCategory}`);
      }
    } catch (error) {
      console.log(`❌ Erreur enregistrement catégorie non mappée:`, error);
      // ✅ Continuer même si l'enregistrement échoue
    }
    
    // Vérifier ce qui a été enregistré
    const savedCategory = await this.prisma.unmappedExternalCategory.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });
    console.log(`🔍 Catégorie sauvegardée:`, savedCategory);
    
    // Pas de fallback - laisser en attente de catégorisation manuelle
    console.log(`⏳ Produit laissé en attente de catégorisation manuelle`);
    console.log(`📝 Catégorie externe "${fakeCategory}" doit être mappée manuellement`);
    
    // Retourner null pour indiquer qu'aucune catégorie n'est assignée
    return null;
  }

  private generateBadge(): string | null {
    const badges = ['promo', 'nouveau', 'tendances', 'top-ventes', null];
    return badges[Math.floor(Math.random() * badges.length)];
  }

  /**
   * Fonction générique pour extraire l'URL d'image de n'importe quel fournisseur
   * Compatible avec DummyJSON, Fake Store, WooCommerce, Shopify, AliExpress, etc.
   */
  private extractImageUrl(product: any): string | null {
    // Priorité 1: images[0] (DummyJSON, Shopify, WooCommerce, AliExpress, etc.)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    // Priorité 2: image (Fake Store, WooCommerce, etc.)
    if (product.image && typeof product.image === 'string') {
      return product.image;
    }
    
    // Priorité 3: thumbnail (DummyJSON, etc.)
    if (product.thumbnail && typeof product.thumbnail === 'string') {
      return product.thumbnail;
    }
    
    // Priorité 4: Autres champs possibles selon les fournisseurs
    if (product.photo && typeof product.photo === 'string') return product.photo;
    if (product.picture && typeof product.picture === 'string') return product.picture;
    if (product.img && typeof product.img === 'string') return product.img;
    if (product.photoUrl && typeof product.photoUrl === 'string') return product.photoUrl;
    if (product.imageUrl && typeof product.imageUrl === 'string') return product.imageUrl;
    
    // Aucune image trouvée
    return null;
  }

  /**
   * Fonction pour extraire TOUTES les images d'un produit
   * Utilisée pour créer la galerie d'images
   */
  private extractAllImages(product: any): string[] {
    const images: string[] = [];
    
    // Priorité 1: images[] (DummyJSON, Shopify, WooCommerce, AliExpress, etc.)
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images.filter((img: any) => typeof img === 'string'));
    }
    
    // Priorité 2: image (Fake Store, WooCommerce, etc.) - si pas déjà dans images[]
    if (product.image && typeof product.image === 'string' && !images.includes(product.image)) {
      images.push(product.image);
    }
    
    // Priorité 3: thumbnail (DummyJSON, etc.) - si pas déjà dans images[]
    if (product.thumbnail && typeof product.thumbnail === 'string' && !images.includes(product.thumbnail)) {
      images.push(product.thumbnail);
    }
    
    // Priorité 4: Autres champs possibles
    const otherImageFields = ['photo', 'picture', 'img', 'photoUrl', 'imageUrl'];
    for (const field of otherImageFields) {
      if (product[field] && typeof product[field] === 'string' && !images.includes(product[field])) {
        images.push(product[field]);
      }
    }
    
    return images;
  }

  // ✅ Nouvelle méthode pour obtenir les catégories externes du magasin CJ
  async getCJExternalCategories() {
    // Récupérer toutes les catégories externes uniques du magasin CJ
    const cjStoreProducts = await this.prisma.cJProductStore.findMany({
      where: {
        category: { not: null }
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    return cjStoreProducts
      .map(p => p.category)
      .filter((category): category is string => category !== null)
      .sort();
  }

  // ✅ Nouvelle méthode pour obtenir les mappings de catégories par fournisseur
  async getCategoryMappings(supplierId: string) {
    if (supplierId === 'cj-dropshipping') {
      // Pour CJ Dropshipping, retourner les catégories externes du magasin
      const externalCategories = await this.getCJExternalCategories();
      return {
        supplierId: 'cj-dropshipping',
        supplierName: 'CJ Dropshipping',
        externalCategories,
        mappings: await this.prisma.categoryMapping.findMany({
          where: { supplierId: 'cj-dropshipping' }
        })
      };
    }

    // Pour les autres fournisseurs, logique existante
    return this.prisma.categoryMapping.findMany({
      where: { supplierId }
    });
  }

  // ✅ Nouvelle méthode pour obtenir les produits du magasin CJ
  async getCJStoreProducts() {
    return this.prisma.cJProductStore.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // ✅ Nouvelle méthode pour obtenir les statistiques du magasin CJ
  async getCJStoreStats() {
    const [total, available, imported] = await Promise.all([
      this.prisma.cJProductStore.count(),
      this.prisma.cJProductStore.count({ where: { status: 'available' } }),
      this.prisma.cJProductStore.count({ where: { status: 'imported' } })
    ]);

    return {
      total,
      available,
      imported,
      pending: total - available - imported
    };
  }

  // ✅ Nouvelle méthode pour réinitialiser le magasin CJ
  async resetCJStore() {
    // Remettre tous les produits importés en statut available
    const updated = await this.prisma.cJProductStore.updateMany({
      where: { status: 'imported' },
      data: { status: 'available' }
    });

    console.log(`🔄 ${updated.count} produits remis en statut 'available'`);

    return {
      message: `Magasin CJ réinitialisé - ${updated.count} produits remis en statut 'available'`,
      stats: await this.getCJStoreStats()
    };
  }
}
