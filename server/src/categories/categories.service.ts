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
            status: {
              in: ['active', 'pending'] // Inclure les produits en attente ET actifs
            }
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            badge: true,
            status: true // Ajouter le statut pour distinguer
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

  async create(data: { name: string; description?: string; icon?: string; color?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description || '',
        icon: data.icon || '🛍️',
        color: data.color || '#4CAF50',
        isDefault: false // ✅ S'assurer que les nouvelles catégories ne sont pas par défaut
      }
    });
  }

  async update(id: string, data: { name?: string; description?: string; icon?: string; color?: string }) {
    return this.prisma.category.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    // Vérifier si c'est une catégorie par défaut
    const category = await this.prisma.category.findUnique({
      where: { id }
    });

    if (category?.isDefault) {
      throw new Error('Impossible de supprimer une catégorie par défaut');
    }

    // Vérifier s'il y a des produits dans cette catégorie
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      throw new Error(`Impossible de supprimer la catégorie car elle contient ${productsCount} produit(s)`);
    }

    return this.prisma.category.delete({
      where: { id }
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
    // Trouver l'ID de la catégorie interne
    const category = await this.prisma.category.findFirst({
      where: { name: data.internalCategory }
    });

    if (!category) {
      throw new Error(`Catégorie interne "${data.internalCategory}" non trouvée`);
    }

    // Créer ou mettre à jour le mapping (upsert)
    const mapping = await this.prisma.categoryMapping.upsert({
      where: {
        supplierId_externalCategory: {
          supplierId: data.supplierId,
          externalCategory: data.externalCategory,
        },
      },
      update: {
        internalCategory: category.id, // Utiliser l'ID au lieu du nom
        status: 'mapped',
      },
      create: {
        supplierId: data.supplierId,
        externalCategory: data.externalCategory,
        internalCategory: category.id, // Utiliser l'ID au lieu du nom
        status: 'mapped',
      },
      include: {
        supplier: true,
      },
    });

    // Mettre à jour tous les produits de cette catégorie externe
    const updatedProducts = await this.prisma.product.updateMany({
      where: {
        supplierId: data.supplierId,
        externalCategory: data.externalCategory,
        status: 'pending',
        categoryId: null, // Seulement ceux qui n'ont pas encore de catégorie
      },
      data: {
        categoryId: category.id, // Utiliser l'ID de la catégorie
      },
    });

    console.log(`✅ Mapping créé/mis à jour: ${data.externalCategory} → ${data.internalCategory} (ID: ${category.id})`);
    console.log(`📦 ${updatedProducts.count} produits mis à jour avec la catégorie`);

    return mapping;
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
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories non mappées:', error);
      throw error;
    }
  }
}
