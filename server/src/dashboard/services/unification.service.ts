import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCategorizationService } from './product-categorization.service';

@Injectable()
export class UnificationService {
  private readonly logger = new Logger(UnificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly categorizationService: ProductCategorizationService,
  ) {}

  /**
   * Unifie complètement le système de catégorisation
   * S'assure que tous les produits sont dans les 7 catégories fixes
   */
  async unifySystem(): Promise<{
    success: boolean;
    message: string;
    stats: {
      totalProducts: number;
      categorizedProducts: number;
      uncategorizedProducts: number;
      categoryDistribution: Record<string, number>;
    };
  }> {
    try {
      this.logger.log('🔄 Début de l\'unification du système...');

      // 1. Récupérer tous les produits actifs
      const allProducts = await this.prisma.product.findMany({
        where: { status: 'active' },
        include: { category: true }
      });

      this.logger.log(`📦 ${allProducts.length} produits actifs trouvés`);

      // 2. Récupérer les 7 catégories fixes
      const fixedCategories = await this.prisma.category.findMany({
        where: {
          name: {
            in: ['Mode', 'Technologie', 'Maison', 'Beauté', 'Accessoires', 'Sport', 'Enfants']
          }
        }
      });

      if (fixedCategories.length !== 7) {
        throw new Error(`Seulement ${fixedCategories.length} catégories fixes trouvées. Attendu: 7`);
      }

      this.logger.log(`🏷️ ${fixedCategories.length} catégories fixes trouvées`);

      // 3. Re-catégoriser tous les produits
      let categorizedCount = 0;
      const categoryDistribution: Record<string, number> = {};

      // Initialiser les compteurs
      fixedCategories.forEach(cat => {
        categoryDistribution[cat.name] = 0;
      });

      for (const product of allProducts) {
        try {
          // Catégoriser le produit
          const categorization = this.categorizationService.categorizeProduct(
            product.name,
            product.description || ''
          );

          // Trouver la catégorie correspondante
          const targetCategory = fixedCategories.find(cat => 
            cat.name === categorization.parentCategory
          );

          if (targetCategory && categorization.confidence > 0.1) {
            // Mettre à jour le produit
            await this.prisma.product.update({
              where: { id: product.id },
              data: {
                categoryId: targetCategory.id,
                mappingConfidence: categorization.confidence,
                isManuallyMapped: false
              }
            });

            categorizedCount++;
            categoryDistribution[targetCategory.name]++;
            
            this.logger.log(`✅ ${product.name} → ${targetCategory.name} (${categorization.confidence.toFixed(2)})`);
          } else {
            // Si pas de catégorie trouvée, assigner à "Accessoires" par défaut
            const defaultCategory = fixedCategories.find(cat => cat.name === 'Accessoires');
            if (defaultCategory) {
              await this.prisma.product.update({
                where: { id: product.id },
                data: {
                  categoryId: defaultCategory.id,
                  mappingConfidence: 0.1,
                  isManuallyMapped: false
                }
              });

              categorizedCount++;
              categoryDistribution['Accessoires']++;
              this.logger.log(`🔧 ${product.name} → Accessoires (par défaut)`);
            }
          }
        } catch (error) {
          this.logger.error(`❌ Erreur pour ${product.name}: ${(error as Error).message}`);
        }
      }

      const uncategorizedCount = allProducts.length - categorizedCount;

      this.logger.log(`🎉 Unification terminée:`);
      this.logger.log(`   - Total: ${allProducts.length}`);
      this.logger.log(`   - Catégorisés: ${categorizedCount}`);
      this.logger.log(`   - Non catégorisés: ${uncategorizedCount}`);
      this.logger.log(`   - Répartition:`, categoryDistribution);

      return {
        success: true,
        message: 'Système unifié avec succès',
        stats: {
          totalProducts: allProducts.length,
          categorizedProducts: categorizedCount,
          uncategorizedProducts: uncategorizedCount,
          categoryDistribution
        }
      };

    } catch (error) {
      this.logger.error(`💥 Erreur lors de l'unification: ${(error as Error).message}`);
      return {
        success: false,
        message: `Erreur lors de l'unification: ${(error as Error).message}`,
        stats: {
          totalProducts: 0,
          categorizedProducts: 0,
          uncategorizedProducts: 0,
          categoryDistribution: {}
        }
      };
    }
  }

  /**
   * Vérifie la cohérence du système
   */
  async checkConsistency(): Promise<{
    success: boolean;
    message: string;
    issues: string[];
    stats: {
      totalProducts: number;
      categoryCounts: Record<string, number>;
      totalInCategories: number;
      isConsistent: boolean;
    };
  }> {
    try {
      // Récupérer tous les produits actifs
      const allProducts = await this.prisma.product.findMany({
        where: { status: 'active' },
        include: { category: true }
      });

      // Récupérer les comptes par catégorie
      const categoryCounts = await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: {
                where: { status: 'active' }
              }
            }
          }
        }
      });

      const categoryCountsMap: Record<string, number> = {};
      let totalInCategories = 0;

      categoryCounts.forEach(cat => {
        categoryCountsMap[cat.name] = cat._count.products;
        totalInCategories += cat._count.products;
      });

      const issues: string[] = [];
      const isConsistent = totalInCategories === allProducts.length;

      if (!isConsistent) {
        issues.push(`Incohérence: ${allProducts.length} produits totaux vs ${totalInCategories} dans les catégories`);
      }

      // Vérifier que tous les produits ont une catégorie
      const productsWithoutCategory = allProducts.filter(p => !p.category);
      if (productsWithoutCategory.length > 0) {
        issues.push(`${productsWithoutCategory.length} produits sans catégorie`);
      }

      return {
        success: true,
        message: isConsistent ? 'Système cohérent' : 'Incohérences détectées',
        issues,
        stats: {
          totalProducts: allProducts.length,
          categoryCounts: categoryCountsMap,
          totalInCategories,
          isConsistent
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la vérification: ${(error as Error).message}`,
        issues: [(error as Error).message],
        stats: {
          totalProducts: 0,
          categoryCounts: {},
          totalInCategories: 0,
          isConsistent: false
        }
      };
    }
  }
}
