import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FakeStoreApiService, FakeStoreProduct } from './fake-store-api.service';

export interface FakeStoreSyncResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  errors: string[];
  duration: number;
}

@Injectable()
export class FakeStoreSyncService {
  constructor(
    private prisma: PrismaService,
    private fakeStoreApi: FakeStoreApiService,
  ) {}

  async syncAllProducts(): Promise<FakeStoreSyncResult> {
    const startTime = Date.now();
    const result: FakeStoreSyncResult = {
      success: false,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      errors: [],
      duration: 0,
    };

    try {
      console.log('🔄 Starting Fake Store API sync...');
      
      // Récupérer tous les produits de l'API
      const fakeStoreProducts = await this.fakeStoreApi.getAllProducts();
      console.log(`📦 Found ${fakeStoreProducts.length} products from Fake Store API`);

      // Créer ou récupérer la catégorie "Fake Store"
      const category = await this.prisma.category.upsert({
        where: { name: 'Fake Store' },
        update: {},
        create: {
          name: 'Fake Store',
          description: 'Products from Fake Store API',
        },
      });

      // Traiter chaque produit
      for (const fakeProduct of fakeStoreProducts) {
        try {
          await this.syncProduct(fakeProduct, category.id, result);
        } catch (error) {
          result.errors.push(`Error processing product ${fakeProduct.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.productsSkipped++;
        }
      }

      result.success = true;
      console.log(`✅ Sync completed: ${result.productsAdded} added, ${result.productsUpdated} updated, ${result.productsSkipped} skipped`);
    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Sync failed:', error);
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  async syncProductById(id: number): Promise<FakeStoreSyncResult> {
    const startTime = Date.now();
    const result: FakeStoreSyncResult = {
      success: false,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      errors: [],
      duration: 0,
    };

    try {
      const fakeProduct = await this.fakeStoreApi.getProductById(id);
      
      const category = await this.prisma.category.upsert({
        where: { name: 'Fake Store' },
        update: {},
        create: {
          name: 'Fake Store',
          description: 'Products from Fake Store API',
        },
      });

      await this.syncProduct(fakeProduct, category.id, result);
      result.success = true;
    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  private async syncProduct(fakeProduct: FakeStoreProduct, categoryId: string, result: FakeStoreSyncResult) {
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        sku: `fake-store-${fakeProduct.id}`,
      },
    });

    const productData = {
      name: fakeProduct.title,
      description: fakeProduct.description,
      price: fakeProduct.price,
      originalPrice: fakeProduct.price,
      image: fakeProduct.image,
      categoryId,
      sku: `fake-store-${fakeProduct.id}`,
      stock: Math.floor(Math.random() * 100) + 1, // Stock aléatoire pour la démo
      status: 'active' as const,
      attributes: JSON.stringify({
        rating: fakeProduct.rating.rate,
        reviewCount: fakeProduct.rating.count,
        originalId: fakeProduct.id,
      }),
    };

    if (existingProduct) {
      await this.prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          ...productData,
          updatedAt: new Date(),
        },
      });
      result.productsUpdated++;
      console.log(`🔄 Updated product: ${fakeProduct.title}`);
    } else {
      await this.prisma.product.create({
        data: productData,
      });
      result.productsAdded++;
      console.log(`➕ Added product: ${fakeProduct.title}`);
    }
  }

  async getSyncStats() {
    const totalProducts = await this.prisma.product.count({
      where: {
        sku: {
          startsWith: 'fake-store-',
        },
      },
    });

    const recentSyncs = await this.prisma.product.findMany({
      where: {
        sku: {
          startsWith: 'fake-store-',
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      select: {
        name: true,
        price: true,
        updatedAt: true,
        status: true,
      },
    });

    return {
      totalProducts,
      recentProducts: recentSyncs,
    };
  }
}
