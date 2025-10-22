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
      return this.getCJStoreProducts(filters);
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
          // Créer le produit KAMRI
          const product = await this.prisma.product.create({
            data: {
              name: cjProduct.name,
              description: cjProduct.description,
              price: cjProduct.price,
              originalPrice: cjProduct.originalPrice,
              image: cjProduct.image,
              supplierId: 'cj-dropshipping',
              externalCategory: cjProduct.category,
              source: 'cj-dropshipping',
              status: 'pending',
              badge: 'nouveau',
              stock: Math.floor(Math.random() * 50) + 10,
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
}
