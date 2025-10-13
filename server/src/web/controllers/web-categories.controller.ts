import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Web - Categories')
@Controller('api/web/categories')
export class WebCategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with product counts for frontend' })
  @ApiResponse({ status: 200, description: 'List of categories with counts' })
  async getAllCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          _count: {
            select: { 
              products: {
                where: { 
                  status: 'active' // Seulement les produits actifs
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      // Calculer le total de tous les produits actifs
      const totalActiveProducts = await this.prisma.product.count({
        where: { status: 'active' }
      });

      // Formater pour le frontend
      const formattedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        count: category._count.products,
        // Ajouter les couleurs et icônes du frontend
        color: this.getCategoryColor(category.name),
        icon: this.getCategoryIcon(category.name)
      }));

      return {
        success: true,
        categories: formattedCategories,
        total: categories.length,
        totalActiveProducts: totalActiveProducts
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération des catégories',
        error: (error as Error).message
      };
    }
  }

  @Get(':categoryName/products')
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
          message: `Catégorie "${categoryName}" non trouvée`,
          products: []
        };
      }

      const products = await this.prisma.product.findMany({
        where: { 
          categoryId: category.id,
          status: 'active'
        },
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
        error: (error as Error).message,
        products: []
      };
    }
  }

  private getCategoryColor(categoryName: string): string {
    const colors = {
      'Mode': '#FF6B6B',
      'Technologie': '#4ECDC4',
      'Maison': '#45B7D1',
      'Beauté': '#FECA57',
      'Accessoires': '#96CEB4',
      'Sport': '#A8E6CF',
      'Enfants': '#FFB6C1'
    };
    return colors[categoryName] || '#4CAF50';
  }

  private getCategoryIcon(categoryName: string): string {
    const icons = {
      'Mode': '👕',
      'Technologie': '💻',
      'Maison': '🏠',
      'Beauté': '💄',
      'Accessoires': '🎒',
      'Sport': '⚽',
      'Enfants': '🧸'
    };
    return icons[categoryName] || '📦';
  }
}
