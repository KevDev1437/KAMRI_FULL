import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';

export interface ExternalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId?: string;
  brand: string;
  stock: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes: Record<string, any>;
  supplierId: string;
}

export interface SyncResult {
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  errors: string[];
  duration: number;
}

@Injectable()
export class ProductsSyncService {
  constructor(
    private prisma: PrismaService,
    private suppliersService: SuppliersService,
  ) {}

  async syncProductsFromSupplier(supplierId: string): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      errors: [],
      duration: 0,
    };

    try {
      const supplier = await this.suppliersService.getSupplierById(supplierId);
      if (!supplier) {
        result.errors.push('Supplier not found');
        return result;
      }

      // TODO: Implémenter la synchronisation réelle avec l'API du fournisseur
      const externalProducts = await this.fetchProductsFromSupplier(supplier);
      
      for (const externalProduct of externalProducts) {
        try {
          const existingProduct = await this.prisma.product.findFirst({
            where: {
              sku: externalProduct.sku,
              supplierId: supplierId,
            },
          });

          if (existingProduct) {
            // Mettre à jour le produit existant
            await this.updateProduct(existingProduct.id, externalProduct, supplier);
            result.productsUpdated++;
          } else {
            // Créer un nouveau produit
            await this.createProduct(externalProduct, supplier);
            result.productsAdded++;
          }
        } catch (error) {
          result.errors.push(`Error processing product ${externalProduct.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.productsSkipped++;
        }
      }

      // Mettre à jour la date de dernière synchronisation
      await this.prisma.supplier.update({
        where: { id: supplierId },
        data: { lastSync: new Date() },
      });

      result.success = true;
    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  async syncAllSuppliers(): Promise<SyncResult[]> {
    const suppliers = await this.suppliersService.getAllSuppliers();
    const activeSuppliers = suppliers.filter(s => s.status === 'active' && s.settings.autoSync);
    
    const results: SyncResult[] = [];
    
    for (const supplier of activeSuppliers) {
      const result = await this.syncProductsFromSupplier(supplier.id);
      results.push(result);
    }

    return results;
  }

  private async fetchProductsFromSupplier(supplier: any): Promise<ExternalProduct[]> {
    // TODO: Implémenter la récupération réelle des produits
    // Simulation pour l'instant
    return [
      {
        id: 'ext-1',
        name: 'Product from Supplier',
        description: 'Description from supplier',
        price: 29.99,
        originalPrice: 39.99,
        images: ['https://example.com/image1.jpg'],
        category: 'Electronics',
        brand: 'Supplier Brand',
        stock: 100,
        sku: 'SUP-001',
        weight: 0.5,
        dimensions: { length: 10, width: 5, height: 2 },
        attributes: { color: 'Black', size: 'M' },
        supplierId: supplier.id,
      },
    ];
  }

  private async createProduct(externalProduct: ExternalProduct, supplier: any) {
    const markupPrice = externalProduct.price * (1 + supplier.settings.priceMarkup / 100);
    
    return this.prisma.product.create({
      data: {
        name: externalProduct.name,
        description: externalProduct.description,
        price: markupPrice,
        originalPrice: externalProduct.price,
        image: externalProduct.images?.[0] || '',
        categoryId: externalProduct.categoryId || 'default-category',
        stock: externalProduct.stock,
        sku: externalProduct.sku,
        weight: externalProduct.weight,
        dimensions: JSON.stringify(externalProduct.dimensions || {}),
        attributes: JSON.stringify(externalProduct.attributes || {}),
        supplierId: supplier.id,
        status: 'active',
        images: {
          create: externalProduct.images?.map(url => ({ url })) || []
        },
      },
    });
  }

  private async updateProduct(productId: string, externalProduct: ExternalProduct, supplier: any) {
    const markupPrice = externalProduct.price * (1 + supplier.settings.priceMarkup / 100);
    
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: externalProduct.name,
        description: externalProduct.description,
        price: markupPrice,
        originalPrice: externalProduct.price,
        image: externalProduct.images?.[0] || '',
        stock: externalProduct.stock,
        attributes: JSON.stringify(externalProduct.attributes || {}),
        updatedAt: new Date(),
        images: {
          deleteMany: {},
          create: externalProduct.images?.map(url => ({ url })) || []
        },
      },
    });
  }

  async getSyncHistory(supplierId?: string) {
    const where = supplierId ? { supplierId } : {};
    
    return this.prisma.syncLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        supplier: {
          select: { name: true }
        }
      }
    });
  }

  async scheduleAutoSync() {
    // TODO: Implémenter la planification automatique
    // Utiliser un scheduler comme Bull ou Agenda
    console.log('Auto sync scheduled');
  }
}
