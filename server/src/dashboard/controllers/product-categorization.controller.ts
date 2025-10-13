import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCategorizationService } from '../services/product-categorization.service';

@ApiTags('Product Categorization')
@Controller('api/categorization')
export class ProductCategorizationController {
  constructor(
    private readonly categorizationService: ProductCategorizationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze all products and suggest categories' })
  @ApiResponse({ status: 200, description: 'Categorization analysis results' })
  async analyzeProducts() {
    try {
      const results = await this.categorizationService.recategorizeAllProducts(this.prisma);
      
      // Grouper par catégorie suggérée
      const groupedResults = results.reduce((acc, result) => {
        const key = `${result.newParentCategory} - ${result.newSubCategory}`;
        if (!acc[key]) {
          acc[key] = {
            category: result.newParentCategory,
            subCategory: result.newSubCategory,
            products: [],
            totalConfidence: 0
          };
        }
        acc[key].products.push({
          id: result.productId,
          name: result.productName,
          confidence: result.confidence
        });
        acc[key].totalConfidence += result.confidence;
        return acc;
      }, {});

      // Calculer la confiance moyenne pour chaque groupe
      Object.values(groupedResults).forEach((group: any) => {
        group.averageConfidence = group.totalConfidence / group.products.length;
      });

      return {
        success: true,
        message: 'Analyse de catégorisation terminée',
        totalProducts: results.length,
        suggestedCategories: Object.values(groupedResults),
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'analyse',
        error: (error as Error).message
      };
    }
  }

  @Get('test/:productName')
  @ApiOperation({ summary: 'Test categorization for a specific product name' })
  @ApiResponse({ status: 200, description: 'Categorization test result' })
  async testCategorization(@Param('productName') productName: string) {
    try {
      const result = this.categorizationService.categorizeProduct(
        decodeURIComponent(productName), 
        ''
      );
      
      return {
        success: true,
        productName: decodeURIComponent(productName),
        categorization: result,
        message: 'Test de catégorisation réussi'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test',
        error: (error as Error).message
      };
    }
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply categorization to all products' })
  @ApiResponse({ status: 200, description: 'Categorization applied successfully' })
  async applyCategorization() {
    try {
      const results = await this.categorizationService.recategorizeAllProducts(this.prisma);
      
      let appliedCount = 0;
      const errors = [];

      for (const result of results) {
        if (result.confidence > 0.2) { // Seuil de confiance abaissé
          try {
            // Créer ou trouver la catégorie parent
            let parentCategory = await this.prisma.category.findFirst({
              where: { name: result.newParentCategory }
            });

            if (!parentCategory) {
              parentCategory = await this.prisma.category.create({
                data: {
                  name: result.newParentCategory,
                  description: `Catégorie ${result.newParentCategory}`
                }
              });
            }

            // Mettre à jour le produit
            await this.prisma.product.update({
              where: { id: result.productId },
              data: { categoryId: parentCategory.id }
            });

            appliedCount++;
          } catch (error) {
            errors.push(`Erreur pour ${result.productName}: ${(error as Error).message}`);
          }
        }
      }

      return {
        success: true,
        message: 'Catégorisation appliquée',
        appliedCount,
        totalAnalyzed: results.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'application',
        error: (error as Error).message
      };
    }
  }
}
