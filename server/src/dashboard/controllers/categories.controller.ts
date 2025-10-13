import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesInitService } from '../services/categories-init.service';
import { ProductCategorizationService } from '../services/product-categorization.service';

@ApiTags('Categories Management')
@Controller('api/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesInitService: CategoriesInitService,
    private readonly categorizationService: ProductCategorizationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize the 7 frontend categories' })
  @ApiResponse({ status: 201, description: 'Categories initialized successfully' })
  async initializeCategories() {
    return this.categoriesInitService.initializeCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with product counts' })
  @ApiResponse({ status: 200, description: 'List of categories with counts' })
  async getCategoriesWithCounts() {
    return this.categoriesInitService.getCategoriesWithCounts();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({ status: 200, description: 'Category statistics' })
  async getCategoryStats() {
    return this.categoriesInitService.getCategoryStats();
  }

  @Post('categorize-products')
  @ApiOperation({ summary: 'Categorize all products using AI' })
  @ApiResponse({ status: 200, description: 'Products categorized successfully' })
  async categorizeAllProducts() {
    try {
      // 1. Initialiser les catégories si elles n'existent pas
      await this.categoriesInitService.initializeCategories();

      // 2. Analyser tous les produits
      const analysisResults = await this.categorizationService.recategorizeAllProducts(this.prisma);
      
      let categorizedCount = 0;
      const errors = [];

      // 3. Appliquer la catégorisation
      for (const result of analysisResults) {
        if (result.confidence > 0.2) { // Seuil de confiance abaissé
          try {
            // Trouver la catégorie correspondante
            const category = await this.prisma.category.findFirst({
              where: { name: result.newParentCategory }
            });

            if (category) {
              // Mettre à jour le produit
              await this.prisma.product.update({
                where: { id: result.productId },
                data: { categoryId: category.id }
              });

              categorizedCount++;
            }
          } catch (error) {
            errors.push(`Erreur pour ${result.productName}: ${(error as Error).message}`);
          }
        }
      }

      return {
        success: true,
        message: 'Catégorisation des produits terminée',
        totalAnalyzed: analysisResults.length,
        categorizedCount,
        errors,
        details: analysisResults
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la catégorisation',
        error: (error as Error).message
      };
    }
  }

  @Get('products/:categoryName')
  @ApiOperation({ summary: 'Get products by category name' })
  @ApiResponse({ status: 200, description: 'Products in the specified category' })
  async getProductsByCategory(@Param('categoryName') categoryName: string) {
    try {
      const category = await this.prisma.category.findFirst({
        where: { name: categoryName }
      });

      if (!category) {
        return {
          success: false,
          message: `Catégorie "${categoryName}" non trouvée`
        };
      }

      const products = await this.prisma.product.findMany({
        where: { categoryId: category.id },
        include: {
          category: true,
          supplier: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        category: {
          id: category.id,
          name: category.name,
          description: category.description
        },
        products,
        count: products.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération des produits',
        error: (error as Error).message
      };
    }
  }
}
