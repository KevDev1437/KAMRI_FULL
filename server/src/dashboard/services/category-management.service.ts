import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoryManagementService {
  private readonly logger = new Logger(CategoryManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Corriger manuellement la catégorisation d'un produit
   */
  async correctProductCategory(
    productId: string, 
    newCategoryId: string, 
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier que le produit existe
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      });

      if (!product) {
        return { success: false, message: 'Produit non trouvé' };
      }

      // Vérifier que la nouvelle catégorie existe
      const newCategory = await this.prisma.category.findUnique({
        where: { id: newCategoryId }
      });

      if (!newCategory) {
        return { success: false, message: 'Catégorie non trouvée' };
      }

      // Mettre à jour le produit
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          categoryId: newCategoryId,
          isManuallyMapped: true,
          mappingConfidence: 1.0, // Confiance maximale pour correction manuelle
          updatedAt: new Date()
        }
      });

      this.logger.log(`✅ Catégorie corrigée: ${product.name} → ${newCategory.name} (Manuel)${reason ? ` - Raison: ${reason}` : ''}`);

      return {
        success: true,
        message: `Catégorie corrigée: ${product.name} → ${newCategory.name}`
      };

    } catch (error) {
      this.logger.error('Erreur lors de la correction de catégorie:', error);
      return {
        success: false,
        message: `Erreur: ${(error as Error).message}`
      };
    }
  }

  /**
   * Obtenir les produits avec une faible confiance de mapping
   */
  async getLowConfidenceProducts(threshold: number = 0.3): Promise<any[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { mappingConfidence: { lt: threshold } },
            { mappingConfidence: null }
          ],
          isManuallyMapped: false
        },
        include: {
          category: true,
          supplier: true
        },
        orderBy: { mappingConfidence: 'asc' }
      });

      return products.map(product => ({
        id: product.id,
        name: product.name,
        currentCategory: product.category.name,
        originalCategory: product.originalCategory,
        supplierCategory: product.supplierCategory,
        confidence: product.mappingConfidence,
        supplier: product.supplier?.name
      }));

    } catch (error) {
      this.logger.error('Erreur lors de la récupération des produits à faible confiance:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques de catégorisation
   */
  async getCategorizationStats(): Promise<any> {
    try {
      const totalProducts = await this.prisma.product.count();
      const manuallyMapped = await this.prisma.product.count({
        where: { isManuallyMapped: true }
      });
      const autoMapped = await this.prisma.product.count({
        where: { isManuallyMapped: false, mappingConfidence: { not: null } }
      });
      const uncategorized = await this.prisma.product.count({
        where: { mappingConfidence: null }
      });

      const avgConfidence = await this.prisma.product.aggregate({
        where: { mappingConfidence: { not: null } },
        _avg: { mappingConfidence: true }
      });

      return {
        totalProducts,
        manuallyMapped,
        autoMapped,
        uncategorized,
        averageConfidence: avgConfidence._avg.mappingConfidence || 0,
        autoMappingRate: totalProducts > 0 ? (autoMapped / totalProducts) * 100 : 0,
        manualMappingRate: totalProducts > 0 ? (manuallyMapped / totalProducts) * 100 : 0
      };

    } catch (error) {
      this.logger.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalProducts: 0,
        manuallyMapped: 0,
        autoMapped: 0,
        uncategorized: 0,
        averageConfidence: 0,
        autoMappingRate: 0,
        manualMappingRate: 0
      };
    }
  }

  /**
   * Obtenir les produits par catégorie originale
   */
  async getProductsByOriginalCategory(originalCategory: string): Promise<any[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { originalCategory },
        include: {
          category: true,
          supplier: true
        }
      });

      return products.map(product => ({
        id: product.id,
        name: product.name,
        currentCategory: product.category.name,
        originalCategory: product.originalCategory,
        confidence: product.mappingConfidence,
        isManuallyMapped: product.isManuallyMapped
      }));

    } catch (error) {
      this.logger.error('Erreur lors de la récupération par catégorie originale:', error);
      return [];
    }
  }

  /**
   * Re-catégoriser tous les produits avec une nouvelle logique
   */
  async recategorizeAllProducts(): Promise<{ success: boolean; message: string; recategorized: number }> {
    try {
      this.logger.log('🔄 Début de la re-catégorisation de tous les produits...');

      const products = await this.prisma.product.findMany({
        where: { isManuallyMapped: false }, // Ne pas re-catégoriser les produits corrigés manuellement
        include: { supplier: true }
      });

      let recategorizedCount = 0;

      for (const product of products) {
        try {
          // Ici, tu peux appeler ton service de catégorisation
          // const newCategorization = this.categorizationService.categorizeProduct(product.name, product.description);
          
          // Pour l'instant, on va juste marquer comme à re-catégoriser
          await this.prisma.product.update({
            where: { id: product.id },
            data: { mappingConfidence: null }
          });

          recategorizedCount++;
        } catch (error) {
          this.logger.error(`Erreur de re-catégorisation pour ${product.name}:`, error);
        }
      }

      this.logger.log(`🎉 Re-catégorisation terminée: ${recategorizedCount} produits marqués`);

      return {
        success: true,
        message: `Re-catégorisation terminée: ${recategorizedCount} produits marqués`,
        recategorized: recategorizedCount
      };

    } catch (error) {
      this.logger.error('Erreur lors de la re-catégorisation:', error);
      return {
        success: false,
        message: `Erreur: ${(error as Error).message}`,
        recategorized: 0
      };
    }
  }
}
