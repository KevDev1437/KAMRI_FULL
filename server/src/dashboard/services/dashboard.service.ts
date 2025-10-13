import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      totalUsers
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true }
      }),
      this.prisma.user.count()
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers
    };
  }

  async getOverview() {
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    const topProducts = await this.prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true
      }
    });

    return {
      recentOrders,
      topProducts
    };
  }
}