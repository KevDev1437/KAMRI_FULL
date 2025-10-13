import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenericSupplierService } from './generic-supplier.service';
import { ProductCategorizationService } from './product-categorization.service';

@Injectable()
export class DummyJsonSyncService {
  private readonly logger = new Logger(DummyJsonSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly genericSupplier: GenericSupplierService,
    private readonly categorizationService: ProductCategorizationService,
  ) {}

  /**
   * Synchronise tous les produits DummyJSON vers la base de données
   */
  async syncAllProducts(): Promise<{ success: boolean; message: string; synced: number; errors: string[] }> {
    try {
      this.logger.log('🔄 Début de la synchronisation DummyJSON...');
      
      // 1. Récupérer tous les produits DummyJSON
      const productsResponse = await this.genericSupplier.getProducts('dummy-json', { limit: 1000 });
      
      if (!productsResponse.success) {
        throw new Error(`Erreur lors de la récupération des produits: ${productsResponse.error}`);
      }

      const products = productsResponse.data;
      this.logger.log(`📦 ${products.length} produits récupérés de DummyJSON`);

      // 2. Créer ou récupérer le fournisseur DummyJSON
      let supplier = await this.prisma.supplier.findFirst({
        where: { name: 'Dummy JSON' }
      });

      if (!supplier) {
        supplier = await this.prisma.supplier.create({
          data: {
            name: 'Dummy JSON',
            apiUrl: 'https://dummyjson.com',
            apiKey: 'none',
            type: 'dropshipping',
            status: 'active',
            settings: JSON.stringify({
              rateLimit: { requests: 1000, window: '1m' },
              auth: { type: 'none' }
            })
          }
        });
        this.logger.log('✅ Fournisseur DummyJSON créé');
      }

      // 3. Récupérer une catégorie temporaire (la première disponible)
      const tempCategory = await this.prisma.category.findFirst();
      if (!tempCategory) {
        throw new Error('Aucune catégorie trouvée. Veuillez d\'abord initialiser les catégories.');
      }

      let syncedCount = 0;
      const errors: string[] = [];

      // 4. Synchroniser chaque produit
      for (const product of products) {
        try {
          // Vérifier si le produit existe déjà
          const existingProduct = await this.prisma.product.findFirst({
            where: {
              OR: [
                { sku: `dummy-json-${product.id}` },
                { name: product.title }
              ]
            }
          });

          if (existingProduct) {
            this.logger.log(`⏭️ Produit "${product.title}" déjà synchronisé, ignoré`);
            continue;
          }

          // Créer le produit avec approche hybride
          const newProduct = await this.prisma.product.create({
            data: {
              name: product.title,
              description: product.description || '',
              price: product.price,
              originalPrice: product.discountPercentage ? 
                Math.round(product.price / (1 - product.discountPercentage / 100) * 100) / 100 : 
                null,
              image: product.thumbnail || product.images?.[0] || null,
              sku: `dummy-json-${product.id}`,
              stock: product.stock || 0,
              supplierId: supplier.id,
              categoryId: tempCategory.id, // Catégorie temporaire
              
              // 🆕 Approche hybride - Conserver les catégories originales
              originalCategory: product.category || null,
              supplierCategory: product.category || null,
              mappingConfidence: null, // Sera calculé par la catégorisation
              isManuallyMapped: false
            }
          });

          syncedCount++;
          this.logger.log(`✅ Produit synchronisé: ${product.title}`);

        } catch (error) {
          const errorMsg = `Erreur pour le produit "${product.title}": ${(error as Error).message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`🎉 Synchronisation terminée: ${syncedCount} produits synchronisés`);

      return {
        success: true,
        message: `Synchronisation DummyJSON terminée: ${syncedCount} produits synchronisés`,
        synced: syncedCount,
        errors
      };

    } catch (error) {
      this.logger.error('💥 Erreur lors de la synchronisation DummyJSON:', error);
      return {
        success: false,
        message: `Erreur de synchronisation: ${(error as Error).message}`,
        synced: 0,
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Applique la catégorisation automatique aux produits DummyJSON
   */
  async categorizeDummyJsonProducts(): Promise<{ success: boolean; message: string; categorized: number }> {
    try {
      this.logger.log('🏷️ Début de la catégorisation des produits DummyJSON...');

      // Récupérer tous les produits DummyJSON
      const dummyJsonProducts = await this.prisma.product.findMany({
        where: {
          supplier: { name: 'Dummy JSON' }
        }
      });

      this.logger.log(`📦 ${dummyJsonProducts.length} produits DummyJSON à catégoriser`);

      let categorizedCount = 0;

      for (const product of dummyJsonProducts) {
        try {
          // Appliquer la catégorisation automatique
          const categorization = this.categorizationService.categorizeProduct(
            product.name, 
            product.description || ''
          );

          if (categorization.confidence > 0.1) {
            // Trouver la catégorie correspondante
            const category = await this.prisma.category.findFirst({
              where: { name: categorization.parentCategory }
            });

            if (category) {
              await this.prisma.product.update({
                where: { id: product.id },
                data: { 
                  categoryId: category.id,
                  // 🆕 Approche hybride - Mettre à jour les métadonnées
                  mappingConfidence: categorization.confidence,
                  isManuallyMapped: false // Auto-catégorisé
                }
              });

              categorizedCount++;
              this.logger.log(`✅ ${product.name} → ${categorization.parentCategory} (${categorization.confidence.toFixed(2)}) [Original: ${product.originalCategory}]`);
            }
          }
        } catch (error) {
          this.logger.error(`Erreur de catégorisation pour ${product.name}:`, error);
        }
      }

      this.logger.log(`🎉 Catégorisation terminée: ${categorizedCount} produits catégorisés`);

      return {
        success: true,
        message: `Catégorisation terminée: ${categorizedCount} produits catégorisés`,
        categorized: categorizedCount
      };

    } catch (error) {
      this.logger.error('💥 Erreur lors de la catégorisation:', error);
      return {
        success: false,
        message: `Erreur de catégorisation: ${(error as Error).message}`,
        categorized: 0
      };
    }
  }

  /**
   * Synchronise et catégorise en une seule opération
   */
  async syncAndCategorize(): Promise<{ 
    success: boolean; 
    message: string; 
    synced: number; 
    categorized: number; 
    errors: string[] 
  }> {
    try {
      // 1. Synchroniser les produits
      const syncResult = await this.syncAllProducts();
      
      if (!syncResult.success) {
        return {
          success: false,
          message: syncResult.message,
          synced: 0,
          categorized: 0,
          errors: syncResult.errors
        };
      }

      // 2. Catégoriser les nouveaux produits
      const categorizeResult = await this.categorizeDummyJsonProducts();

      return {
        success: true,
        message: `Synchronisation et catégorisation terminées: ${syncResult.synced} produits synchronisés, ${categorizeResult.categorized} catégorisés`,
        synced: syncResult.synced,
        categorized: categorizeResult.categorized,
        errors: syncResult.errors
      };

    } catch (error) {
      this.logger.error('💥 Erreur lors de la synchronisation et catégorisation:', error);
      return {
        success: false,
        message: `Erreur: ${(error as Error).message}`,
        synced: 0,
        categorized: 0,
        errors: [(error as Error).message]
      };
    }
  }
}
