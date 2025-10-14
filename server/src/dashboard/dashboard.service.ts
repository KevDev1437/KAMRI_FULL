import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalProducts,
      promoProducts,
      totalOrders,
      connectedSuppliers,
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.product.count({
        where: { status: 'active' },
      }),
      this.prisma.product.count({
        where: { 
          badge: 'promo',
          status: 'active'
        },
      }),
      this.prisma.order.count(),
      this.prisma.supplier.count({
        where: { status: 'connected' },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { status: 'active' },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'cancelled' } },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'cancelled' },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalProducts,
      promoProducts,
      totalOrders,
      connectedSuppliers,
      totalUsers,
      activeUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
    };
  }

  async getRecentActivity() {
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    const recentProducts = await this.prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true },
        },
        supplier: {
          select: { name: true },
        },
      },
    });

    return {
      recentOrders,
      recentProducts,
    };
  }

  async getSalesChart() {
    const last12Months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const revenue = await this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'cancelled' },
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      });

      last12Months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: revenue._sum.total || 0,
      });
    }

    return last12Months;
  }

  async getTopCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { 
            products: {
              where: { status: 'active' }
            }
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: 7,
    });

    return categories.map(category => ({
      name: category.name,
      productCount: category._count.products,
    }));
  }
}
