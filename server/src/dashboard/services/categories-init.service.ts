import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesInitService {
  constructor(private prisma: PrismaService) {}

  // Les 7 catégories du frontend
  private readonly frontendCategories = [
    {
      name: 'Mode',
      description: 'Vêtements et accessoires de mode',
      color: '#FF6B6B',
      icon: '👕'
    },
    {
      name: 'Technologie',
      description: 'Électronique et technologie',
      color: '#4ECDC4',
      icon: '💻'
    },
    {
      name: 'Maison',
      description: 'Décoration et équipement maison',
      color: '#45B7D1',
      icon: '🏠'
    },
    {
      name: 'Beauté',
      description: 'Produits de beauté et soins',
      color: '#FECA57',
      icon: '💄'
    },
    {
      name: 'Accessoires',
      description: 'Bijoux et accessoires',
      color: '#96CEB4',
      icon: '🎒'
    },
    {
      name: 'Sport',
      description: 'Équipement et vêtements de sport',
      color: '#A8E6CF',
      icon: '⚽'
    },
    {
      name: 'Enfants',
      description: 'Produits pour enfants',
      color: '#FFB6C1',
      icon: '🧸'
    }
  ];

  async initializeCategories() {
    const results = [];
    
    for (const categoryData of this.frontendCategories) {
      try {
        // Vérifier si la catégorie existe déjà
        const existingCategory = await this.prisma.category.findFirst({
          where: { name: categoryData.name }
        });

        if (existingCategory) {
          results.push({
            name: categoryData.name,
            status: 'exists',
            id: existingCategory.id,
            message: 'Catégorie déjà existante'
          });
        } else {
          // Créer la catégorie
          const newCategory = await this.prisma.category.create({
            data: {
              name: categoryData.name,
              description: categoryData.description
            }
          });

          results.push({
            name: categoryData.name,
            status: 'created',
            id: newCategory.id,
            message: 'Catégorie créée avec succès'
          });
        }
      } catch (error) {
        results.push({
          name: categoryData.name,
          status: 'error',
          message: `Erreur: ${(error as Error).message}`
        });
      }
    }

    return {
      success: true,
      message: 'Initialisation des catégories terminée',
      results
    };
  }

  async getCategoriesWithCounts() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products,
      createdAt: category.createdAt
    }));
  }

  async getCategoryStats() {
    const totalCategories = await this.prisma.category.count();
    const totalProducts = await this.prisma.product.count();
    
    const categoriesWithProducts = await this.prisma.category.findMany({
      where: {
        products: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      }
    });

    return {
      totalCategories,
      totalProducts,
      categoriesWithProducts: categoriesWithProducts.length,
      topCategories: categoriesWithProducts.slice(0, 5)
    };
  }
}
