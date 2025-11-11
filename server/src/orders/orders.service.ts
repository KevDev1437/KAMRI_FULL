import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderCJIntegrationService } from './order-cj-integration.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private orderCJIntegration: OrderCJIntegrationService,
  ) {}

  async createOrder(userId: string, items: any[]) {
    this.logger.log(`📦 Création commande pour user ${userId}`);
    
    // Créer la commande KAMRI dans une transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const createdOrder = await tx.order.create({
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

      this.logger.log(`✅ Commande KAMRI créée: ${createdOrder.id}`);

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return createdOrder;
    });

    // ✨ NOUVEAU : Créer automatiquement la commande CJ si nécessaire
    // Note: On fait ça après la transaction pour éviter de bloquer la création KAMRI
    // en cas d'erreur CJ
    try {
      const cjResult = await this.orderCJIntegration.createCJOrder(order.id);
      
      if (cjResult.success) {
        this.logger.log(`✅ Commande CJ créée automatiquement: ${cjResult.cjOrderId}`);
      } else if (cjResult.skipped) {
        this.logger.log(`ℹ️ Commande sans produits CJ, skip`);
      } else {
        this.logger.warn(`⚠️ Échec création CJ: ${cjResult.message}`);
        // Ne pas bloquer la commande KAMRI si échec CJ
        // TODO: Ajouter à une queue de retry
      }
    } catch (error: any) {
      this.logger.error(`❌ Erreur création commande CJ:`, error.message);
      // Ne pas bloquer la commande KAMRI
    }

    return order;
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

