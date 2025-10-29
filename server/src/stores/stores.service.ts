import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // ✅ Obtenir tous les magasins disponibles
  async getAllStores() {
    const stores = [];

    // Magasin CJ Dropshipping
    const cjConfig = await this.prisma.cJConfig.findFirst();
    if (cjConfig && cjConfig.enabled) {
      const cjStats = await this.getCJStoreStats();
      stores.push({
        id: 'cj-dropshipping',
        name: 'CJ Dropshipping',
        description: 'Magasin de produits CJ Dropshipping',
        type: 'cj-dropshipping',
        status: cjConfig.enabled ? 'active' : 'inactive',
        stats: cjStats,
        lastSync: await this.getCJLastSync(),
        config: {
          email: cjConfig.email,
          tier: cjConfig.tier,
          enabled: cjConfig.enabled
        }
      });
    }

    // Ajouter d'autres magasins ici (AliExpress, Shopify, etc.)
    
    return stores;
  }

  // ✅ Obtenir les produits d'un magasin spécifique
  async getStoreProducts(storeId: string, filters?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (storeId === 'cj-dropshipping') {
      const result = await this.getCJStoreProducts(filters);
      
      // Récupérer les catégories uniques pour le filtre
      const uniqueCategories = await this.prisma.cJProductStore.findMany({
        distinct: ['category'],
        select: { category: true },
        where: {
          AND: [
            { category: { not: null } },
            { category: { not: '' } }
          ]
        },
      });
      const categories = uniqueCategories.map(c => c.category!).filter(Boolean) as string[];

      return { 
        products: result.products, 
        pagination: result.pagination,
        categories 
      };
    }

    throw new Error(`Magasin ${storeId} non trouvé`);
  }

  // ✅ Obtenir les statistiques d'un magasin
  async getStoreStats(storeId: string) {
    if (storeId === 'cj-dropshipping') {
      return this.getCJStoreStats();
    }

    throw new Error(`Magasin ${storeId} non trouvé`);
  }

  // ✅ Méthodes spécifiques pour le magasin CJ
  private async getCJStoreProducts(filters?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive'
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.cJProductStore.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.cJProductStore.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  private async getCJStoreStats() {
    const [total, available, imported, selected] = await Promise.all([
      this.prisma.cJProductStore.count(),
      this.prisma.cJProductStore.count({ where: { status: 'available' } }),
      this.prisma.cJProductStore.count({ where: { status: 'imported' } }),
      this.prisma.cJProductStore.count({ where: { status: 'selected' } })
    ]);

    return {
      total,
      available,
      imported,
      selected,
      pending: total - available - imported - selected
    };
  }

  private async getCJLastSync() {
    const lastProduct = await this.prisma.cJProductStore.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    return lastProduct?.createdAt || null;
  }

  // ✅ Sélectionner/désélectionner des produits
  async toggleProductSelection(storeId: string, productId: string) {
    if (storeId === 'cj-dropshipping') {
      const product = await this.prisma.cJProductStore.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Produit non trouvé');
      }

      const newStatus = product.status === 'selected' ? 'available' : 'selected';
      
      return this.prisma.cJProductStore.update({
        where: { id: productId },
        data: { status: newStatus }
      });
    }

    throw new Error(`Magasin ${storeId} non trouvé`);
  }

  // ✅ Importer les produits sélectionnés
  async importSelectedProducts(storeId: string) {
    if (storeId === 'cj-dropshipping') {
      // Récupérer l'ID du fournisseur CJ Dropshipping
      const cjSupplier = await this.prisma.supplier.findFirst({
        where: { name: 'CJ Dropshipping' }
      });

      if (!cjSupplier) {
        return {
          message: 'Fournisseur CJ Dropshipping non trouvé',
          imported: 0
        };
      }

      const selectedProducts = await this.prisma.cJProductStore.findMany({
        where: { status: 'selected' }
      });

      if (selectedProducts.length === 0) {
        return {
          message: 'Aucun produit sélectionné',
          imported: 0
        };
      }

      const importedProducts = [];

      for (const cjProduct of selectedProducts) {
        try {
          console.log(`🔄 Import du produit: ${cjProduct.name}`);
          
          // Créer le produit KAMRI avec TOUTES les données CJ
          const product = await this.prisma.product.create({
            data: {
              name: cjProduct.name,
              description: cjProduct.description,
              price: cjProduct.price,
              originalPrice: cjProduct.originalPrice,
              image: cjProduct.image,
              supplierId: cjSupplier.id, // Utiliser l'ID réel du fournisseur
              externalCategory: cjProduct.category,
              source: 'cj-dropshipping',
              status: 'pending',
              badge: 'nouveau',
              stock: Math.floor(Math.random() * 50) + 10,
              
              // ✅ TOUTES LES DONNÉES DÉTAILLÉES CJ
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
              variants: cjProduct.variants, // JSON des 48+ variants
              cjReviews: cjProduct.reviews, // JSON des avis CJ
              dimensions: cjProduct.dimensions,
              brand: cjProduct.brand,
              tags: cjProduct.tags, // JSON des tags
            },
          });

          // Marquer comme importé
          await this.prisma.cJProductStore.update({
            where: { id: cjProduct.id },
            data: { status: 'imported' }
          });

          // Créer le mapping
          await this.prisma.cJProductMapping.create({
            data: {
              productId: product.id,
              cjProductId: cjProduct.cjProductId,
              cjSku: cjProduct.cjProductId,
              lastSyncAt: new Date(),
            },
          });

          importedProducts.push(product);
        } catch (error) {
          console.error(`Erreur lors de l'import du produit ${cjProduct.name}:`, error);
        }
      }

      return {
        message: `${importedProducts.length} produits importés avec succès`,
        imported: importedProducts.length,
        products: importedProducts
      };
    }

    throw new Error(`Magasin ${storeId} non trouvé`);
  }

  // ✅ Mettre à jour un produit du magasin (édition depuis la modale)
  async updateStoreProduct(
    storeId: string,
    productId: string,
    updateData: Partial<{
      name: string;
      description: string;
      price: number;
      originalPrice?: number;
      image?: string;
      category?: string;
      status?: string;
      isFavorite?: boolean;
      productSku?: string;
      productWeight?: string;
      packingWeight?: string;
      productType?: string;
      productUnit?: string;
      productKeyEn?: string;
      materialNameEn?: string;
      packingNameEn?: string;
      suggestSellPrice?: string;
      listedNum?: number;
      supplierName?: string;
      dimensions?: string;
      brand?: string;
      tags?: string; // JSON string
      variants?: string; // JSON string
      reviews?: string; // JSON string
    }>
  ) {
    if (storeId !== 'cj-dropshipping') {
      throw new Error(`Magasin ${storeId} non trouvé`);
    }

    // Vérifier l'existence du produit
    const existing = await this.prisma.cJProductStore.findUnique({ where: { id: productId } });
    if (!existing) {
      throw new Error('Produit non trouvé');
    }

    // Whitelist des champs autorisés pour éviter toute régression
    const allowedFields: (keyof typeof updateData)[] = [
      'name', 'description', 'price', 'originalPrice', 'image', 'category', 'status', 'isFavorite',
      'productSku', 'productWeight', 'packingWeight', 'productType', 'productUnit', 'productKeyEn',
      'materialNameEn', 'packingNameEn', 'suggestSellPrice', 'listedNum', 'supplierName', 'dimensions',
      'brand', 'tags', 'variants', 'reviews'
    ];

    const data: Record<string, any> = {};
    for (const key of allowedFields) {
      const value = (updateData as any)[key];
      if (value !== undefined) {
        data[key as string] = value;
      }
    }

    // Pas de mise à jour inutile
    if (Object.keys(data).length === 0) {
      return existing;
    }

    // Mise à jour sécurisée
    const updated = await this.prisma.cJProductStore.update({
      where: { id: productId },
      data
    });

    return updated;
  }
}
