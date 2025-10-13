import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  totalRevenue: number;
  productsBySupplier: Array<{
    supplierName: string;
    productCount: number;
    lastSync: Date | null;
  }>;
  recentSyncs: Array<{
    supplierName: string;
    status: string;
    productsAdded: number;
    productsUpdated: number;
    createdAt: Date;
  }>;
  topCategories: Array<{
    categoryName: string;
    productCount: number;
    revenue: number;
  }>;
}

export interface SyncAnalytics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDuration: number;
  totalProductsSynced: number;
  syncsByDay: Array<{
    date: string;
    syncs: number;
    success: number;
    failed: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalProducts,
      totalSuppliers,
      activeSuppliers,
      totalOrders,
      totalRevenue,
      productsBySupplier,
      recentSyncs,
      topCategories,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.supplier.count(),
      this.prisma.supplier.count({ where: { status: 'active' } }),
      this.prisma.order.count(),
      this.getTotalRevenue(),
      this.getProductsBySupplier(),
      this.getRecentSyncs(),
      this.getTopCategories(),
    ]);

    return {
      totalProducts,
      totalSuppliers,
      activeSuppliers,
      totalOrders,
      totalRevenue,
      productsBySupplier,
      recentSyncs,
      topCategories,
    };
  }

  async getSyncAnalytics(days: number = 30): Promise<SyncAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const syncs = await this.prisma.syncLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        supplier: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSyncs = syncs.length;
    const successfulSyncs = syncs.filter(s => s.status === 'success').length;
    const failedSyncs = syncs.filter(s => s.status === 'failed').length;
    const averageDuration = syncs.reduce((sum, s) => sum + s.duration, 0) / totalSyncs || 0;
    const totalProductsSynced = syncs.reduce((sum, s) => sum + s.productsAdded + s.productsUpdated, 0);

    // Grouper par jour
    const syncsByDay = this.groupSyncsByDay(syncs, days);

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      averageDuration,
      totalProductsSynced,
      syncsByDay,
    };
  }

  async getSupplierPerformance(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        products: true,
        syncLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const totalProducts = supplier.products.length;
    const activeProducts = supplier.products.filter(p => p.status === 'active').length;
    const lastSync = supplier.lastSync;
    const recentSyncs = supplier.syncLogs;

    const syncStats = {
      total: recentSyncs.length,
      successful: recentSyncs.filter(s => s.status === 'success').length,
      failed: recentSyncs.filter(s => s.status === 'failed').length,
      averageDuration: recentSyncs.reduce((sum, s) => sum + s.duration, 0) / recentSyncs.length || 0,
    };

    return {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        status: supplier.status,
        type: supplier.type,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
      },
      sync: {
        lastSync,
        stats: syncStats,
        recentSyncs: recentSyncs.map(s => ({
          status: s.status,
          productsAdded: s.productsAdded,
          productsUpdated: s.productsUpdated,
          productsSkipped: s.productsSkipped,
          duration: s.duration,
          createdAt: s.createdAt,
        })),
      },
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    return result._sum.total || 0;
  }

  private async getProductsBySupplier() {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return suppliers.map(supplier => ({
      supplierName: supplier.name,
      productCount: supplier._count.products,
      lastSync: supplier.lastSync,
    }));
  }

  private async getRecentSyncs() {
    const syncs = await this.prisma.syncLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: { name: true }
        }
      }
    });

    return syncs.map(sync => ({
      supplierName: sync.supplier.name,
      status: sync.status,
      productsAdded: sync.productsAdded,
      productsUpdated: sync.productsUpdated,
      createdAt: sync.createdAt,
    }));
  }

  private async getTopCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: true
          }
        }
      }
    });

    return categories.map(category => {
      const productCount = category.products.length;
      const revenue = category.products.reduce((sum, product) => {
        return sum + product.orderItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
      }, 0);

      return {
        categoryName: category.name,
        productCount,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  private groupSyncsByDay(syncs: any[], days: number) {
    const daysMap = new Map();
    
    // Initialiser tous les jours
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      daysMap.set(dateStr, { date: dateStr, syncs: 0, success: 0, failed: 0 });
    }

    // Compter les syncs par jour
    syncs.forEach(sync => {
      const dateStr = sync.createdAt.toISOString().split('T')[0];
      if (daysMap.has(dateStr)) {
        const day = daysMap.get(dateStr);
        day.syncs++;
        if (sync.status === 'success') day.success++;
        if (sync.status === 'failed') day.failed++;
      }
    });

    return Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
