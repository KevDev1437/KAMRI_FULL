import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Product Stats')
@Controller('api/stats')
export class ProductStatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get detailed product statistics' })
  @ApiResponse({ status: 200, description: 'Product statistics' })
  async getProductStats() {
    try {
      // Compter tous les produits
      const totalProducts = await this.prisma.product.count();
      
      // Compter les produits actifs
      const activeProducts = await this.prisma.product.count({
        where: { status: 'active' }
      });
      
      // Compter les produits inactifs
      const inactiveProducts = await this.prisma.product.count({
        where: { status: 'inactive' }
      });
      
      // Compter par catégorie
      const productsByCategory = await this.prisma.category.findMany({
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
      
      // Compter par fournisseur
      const productsBySupplier = await this.prisma.supplier.findMany({
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
      
      return {
        success: true,
        totalProducts,
        activeProducts,
        inactiveProducts,
        productsByCategory: productsByCategory.map(cat => ({
          name: cat.name,
          count: cat._count.products
        })),
        productsBySupplier: productsBySupplier.map(supp => ({
          name: supp.name,
          count: supp._count.products
        })),
        summary: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          categories: productsByCategory.length,
          suppliers: productsBySupplier.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: (error as Error).message
      };
    }
  }
}
