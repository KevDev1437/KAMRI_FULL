import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryManagementService } from '../services/category-management.service';

@ApiTags('Category Management')
@Controller('api/admin/categories')
export class CategoryManagementController {
  constructor(private readonly categoryManagementService: CategoryManagementService) {}

  @Get('low-confidence')
  @ApiOperation({ summary: 'Obtenir les produits avec une faible confiance de catégorisation' })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Seuil de confiance (défaut: 0.3)' })
  @ApiResponse({ status: 200, description: 'Liste des produits à faible confiance' })
  async getLowConfidenceProducts(@Query('threshold') threshold: number = 0.3) {
    return this.categoryManagementService.getLowConfidenceProducts(threshold);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de catégorisation' })
  @ApiResponse({ status: 200, description: 'Statistiques de catégorisation' })
  async getCategorizationStats() {
    return this.categoryManagementService.getCategorizationStats();
  }

  @Get('by-original/:originalCategory')
  @ApiOperation({ summary: 'Obtenir les produits par catégorie originale' })
  @ApiParam({ name: 'originalCategory', description: 'Catégorie originale du fournisseur' })
  @ApiResponse({ status: 200, description: 'Liste des produits par catégorie originale' })
  async getProductsByOriginalCategory(@Param('originalCategory') originalCategory: string) {
    return this.categoryManagementService.getProductsByOriginalCategory(originalCategory);
  }

  @Put(':productId/correct')
  @ApiOperation({ summary: 'Corriger manuellement la catégorisation d\'un produit' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newCategoryId: { type: 'string', description: 'ID de la nouvelle catégorie' },
        reason: { type: 'string', description: 'Raison de la correction (optionnel)' }
      },
      required: ['newCategoryId']
    }
  })
  @ApiResponse({ status: 200, description: 'Catégorisation corrigée avec succès' })
  async correctProductCategory(
    @Param('productId') productId: string,
    @Body() body: { newCategoryId: string; reason?: string }
  ) {
    return this.categoryManagementService.correctProductCategory(
      productId, 
      body.newCategoryId, 
      body.reason
    );
  }

  @Post('recategorize')
  @ApiOperation({ summary: 'Re-catégoriser tous les produits (sauf ceux corrigés manuellement)' })
  @ApiResponse({ status: 200, description: 'Re-catégorisation terminée' })
  async recategorizeAllProducts() {
    return this.categoryManagementService.recategorizeAllProducts();
  }
}
