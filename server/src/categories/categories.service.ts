import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            badge: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            status: 'active'
          }
        }
      }
    });
  }

  async getCategoryMappings() {
    return this.prisma.categoryMapping.findMany({
      include: {
        supplier: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createCategoryMapping(data: {
    supplierId: string;
    externalCategory: string;
    internalCategory: string;
  }) {
    return this.prisma.categoryMapping.create({
      data: {
        supplierId: data.supplierId,
        externalCategory: data.externalCategory,
        internalCategory: data.internalCategory,
        status: 'mapped',
      },
      include: {
        supplier: true,
      },
    });
  }

  async updateCategoryMapping(id: string, data: {
    internalCategory?: string;
    status?: string;
  }) {
    return this.prisma.categoryMapping.update({
      where: { id },
      data,
      include: {
        supplier: true,
      },
    });
  }

  async getUnmappedExternalCategories() {
    try {
      console.log('🔍 Recherche des catégories non mappées...');
      // TODO: Réactiver après résolution du problème Prisma
      /*
      const categories = await this.prisma.unmappedExternalCategory.findMany({
        include: {
          supplier: true,
        },
        orderBy: {
          productCount: 'desc',
        },
      });
      console.log(`📦 ${categories.length} catégories non mappées trouvées:`, categories);
      return categories;
      */
      console.log('📦 Aucune catégorie non mappée (temporairement désactivé)');
      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories non mappées:', error);
      throw error;
    }
  }
}
