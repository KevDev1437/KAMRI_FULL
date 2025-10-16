import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, items: any[]) {
    return this.prisma.$transaction(async (tx) => {
      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserOrders(userId: string) {
    console.log('📦 [OrdersService] Récupération des commandes pour userId:', userId);
    
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                supplier: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📦 [OrdersService] Commandes trouvées:', orders.length);
    return {
      data: orders,
      message: 'Commandes récupérées avec succès',
    };
  }

  async getOrder(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }
}

