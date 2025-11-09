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

    // ✅ Unifié : Mettre à jour tous les produits draft de cette catégorie externe
    const updatedProducts = await this.prisma.product.updateMany({
      where: {
        supplierId: data.supplierId,
        externalCategory: data.externalCategory,
        status: 'draft', // ✅ Unifié : uniquement draft
        categoryId: null, // Seulement ceux qui n'ont pas encore de catégorie
      },
      data: {
        categoryId: category.id, // Utiliser l'ID de la catégorie
      },
    });

    console.log(`✅ Mapping créé/mis à jour: ${data.externalCategory} → ${data.internalCategory} (ID: ${category.id})`);
    console.log(`📦 ${updatedProducts.count} produits draft mis à jour avec la catégorie`);

    // ✅ NOUVEAU : Créer automatiquement les produits depuis CJProductStore vers Product (draft)
    const createdProducts = await this.createProductsFromCJStore(data.supplierId, data.externalCategory, category.id);

    console.log(`📦 ${createdProducts.count} nouveaux produits créés depuis CJProductStore vers draft`);

    return {
      ...mapping,
      updatedProducts: updatedProducts.count,
      createdProducts: createdProducts.count
    };
  }

  /**
   * Créer automatiquement les produits depuis CJProductStore vers Product (draft)
   * lorsqu'un mapping de catégorie est créé
   */
  private async createProductsFromCJStore(supplierId: string, externalCategory: string, categoryId: string) {
    console.log(`🔄 [CREATE-FROM-STORE] Création produits depuis CJProductStore pour catégorie: ${externalCategory}`);

    // Récupérer tous les produits CJProductStore avec cette catégorie externe qui ne sont pas encore importés
    const cjStoreProducts = await this.prisma.cJProductStore.findMany({
      where: {
        category: externalCategory,
        status: 'available' // Seulement ceux qui ne sont pas encore importés
      }
    });

    console.log(`📋 [CREATE-FROM-STORE] ${cjStoreProducts.length} produit(s) trouvé(s) dans CJProductStore`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const cjProduct of cjStoreProducts) {
      try {
        // Vérifier si le produit n'est pas déjà dans Product
        const existingProduct = await this.prisma.product.findFirst({
          where: {
            cjProductId: cjProduct.cjProductId
          }
        });

        if (existingProduct) {
          console.log(`⚠️ [CREATE-FROM-STORE] Produit déjà dans Product: ${cjProduct.name}`);
          skippedCount++;
          continue;
        }

        // Nettoyer le nom et la description
        const cleanedName = this.cleanProductName(cjProduct.name || '');
        const cleanedDescription = this.cleanProductDescription(cjProduct.description || '');

        // Calculer le prix avec marge par défaut (30%)
        const margin = 30;
        const originalPrice = cjProduct.originalPrice || cjProduct.price;
        const calculatedPrice = originalPrice * (1 + margin / 100);

        // Créer le produit dans Product (draft)
        const product = await this.prisma.product.create({
          data: {
            name: cleanedName,
            description: cleanedDescription,
            price: calculatedPrice,
            originalPrice: originalPrice,
            image: cjProduct.image,
            categoryId: categoryId, // ✅ Utiliser la catégorie mappée
            supplierId: supplierId,
            externalCategory: externalCategory,
            source: 'cj-dropshipping',
            status: 'draft', // ✅ Statut draft
            margin: margin,
            stock: 0,
            
            // Données CJ détaillées
            cjProductId: cjProduct.cjProductId,
            productSku: cjProduct.productSku,
            productWeight: cjProduct.productWeight,
            packingWeight: cjProduct.packingWeight,
            productType: cjProduct.productType,
            productUnit: cjProduct.productUnit,
            productKeyEn: cjProduct.productKeyEn,
            materialNameEn: cjProduct.materialNameEn,
            packingNameEn: cjProduct.packingNameEn,
            suggestSellPrice: cjProduct.suggestSellPrice,
            listedNum: cjProduct.listedNum,
            supplierName: cjProduct.supplierName,
            createrTime: cjProduct.createrTime,
            variants: cjProduct.variants,
            cjReviews: cjProduct.reviews,
            dimensions: cjProduct.dimensions,
            brand: cjProduct.brand,
            tags: cjProduct.tags,
            
            // Créer le mapping CJ
            cjMapping: {
              create: {
                cjProductId: cjProduct.cjProductId,
                cjSku: cjProduct.productSku || cjProduct.cjProductId
              }
            }
          }
        });

        // Marquer comme importé dans CJProductStore
        await this.prisma.cJProductStore.update({
          where: { id: cjProduct.id },
          data: { status: 'imported' }
        });

        console.log(`✅ [CREATE-FROM-STORE] Produit créé: ${product.name} (ID: ${product.id})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ [CREATE-FROM-STORE] Erreur lors de la création du produit ${cjProduct.name}:`, error);
        skippedCount++;
      }
    }

    console.log(`✅ [CREATE-FROM-STORE] ${createdCount} produit(s) créé(s), ${skippedCount} ignoré(s)`);

    return {
      count: createdCount,
      skipped: skippedCount,
      total: cjStoreProducts.length
    };
  }

  /**
   * Nettoyer le nom d'un produit
   */
  private cleanProductName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/\s+/g, ' ') // Espaces multiples
      .replace(/[^\w\s-]/gi, '') // Caractères spéciaux (sauf tirets)
      .substring(0, 200); // Limite de longueur
  }

  /**
   * Nettoyer la description d'un produit
   */
  private cleanProductDescription(description: string): string {
    if (!description) return '';
    
    // Supprimer les balises HTML
    let cleaned = description
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim();
    
    return cleaned;
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
