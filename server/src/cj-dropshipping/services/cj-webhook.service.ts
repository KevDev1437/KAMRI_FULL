import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import { CJWebhookPayload } from '../interfaces/cj-webhook.interface';

@Injectable()
export class CJWebhookService {
  private readonly logger = new Logger(CJWebhookService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient
  ) {}

  /**
   * Initialiser le client CJ avec la configuration
   */
  private async initializeClient(): Promise<CJAPIClient> {
    this.logger.log('🚀 Initialisation du client CJ...');
    
    // Vérifier si on a un token valide
    const hasToken = this.cjApiClient['accessToken'];
    const tokenExpiry = this.cjApiClient['tokenExpiry'];
    const isTokenValid = hasToken && tokenExpiry && new Date() < tokenExpiry;
    
    if (!isTokenValid) {
      this.logger.log('🔑 Pas de token valide - Login CJ requis');
      
      const config = await this.prisma.cJConfig.findFirst();
      if (!config?.enabled) {
        throw new Error('L\'intégration CJ Dropshipping est désactivée');
      }

      // Initialiser la configuration du client injecté
      this.cjApiClient.setConfig({
        email: config.email,
        apiKey: config.apiKey,
        tier: config.tier as 'free' | 'plus' | 'prime' | 'advanced',
        platformToken: config.platformToken,
        debug: process.env.CJ_DEBUG === 'true',
      });

      await this.cjApiClient.login();
      this.logger.log('✅ Login CJ réussi');
    } else {
      this.logger.log('✅ Token CJ déjà valide - Utilisation de la connexion existante');
    }
    
    return this.cjApiClient;
  }

  /**
   * Gérer les webhooks CJ
   */
  async handleWebhook(type: string, payload: CJWebhookPayload): Promise<void> {
    try {
      // Logger le webhook
      await this.prisma.cJWebhookLog.create({
        data: {
          type,
          messageId: payload.messageId,
          payload: JSON.stringify(payload),
          processed: false,
        },
      });

      // Traiter selon le type
      switch (type) {
        case 'PRODUCT':
          await this.handleProductWebhook(payload);
          break;
        case 'STOCK':
          await this.handleStockWebhook(payload);
          break;
        case 'ORDER':
          await this.handleOrderWebhook(payload);
          break;
        case 'LOGISTICS':
          await this.handleLogisticsWebhook(payload);
          break;
      }

      // Marquer comme traité
      await this.prisma.cJWebhookLog.updateMany({
        where: { messageId: payload.messageId },
        data: { processed: true },
      });

      this.logger.log(`Webhook ${type} traité avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors du traitement du webhook ${type}:`, error);
      
      // Logger l'erreur
      await this.prisma.cJWebhookLog.updateMany({
        where: { messageId: payload.messageId },
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      
      throw error;
    }
  }

  /**
   * Gérer le webhook de stock
   */
  private async handleStockWebhook(payload: CJWebhookPayload): Promise<void> {
    const stockData = payload.params;
    
    for (const [vid, stockInfo] of Object.entries(stockData)) {
      const mapping = await this.prisma.cJProductMapping.findFirst({
        where: { cjProductId: vid },
      });
      
      if (mapping) {
        const stock = Array.isArray(stockInfo) ? stockInfo[0]?.storageNum || 0 : stockInfo;
        
        await this.prisma.product.update({
          where: { id: mapping.productId },
          data: { stock: Number(stock) },
        });
      }
    }
  }

  /**
   * Gérer le webhook de commande
   */
  private async handleOrderWebhook(payload: CJWebhookPayload): Promise<void> {
    const { orderNumber, orderStatus, trackNumber } = payload.params;
    
    const mapping = await this.prisma.cJOrderMapping.findFirst({
      where: { cjOrderNumber: orderNumber },
    });
    
    if (mapping) {
      await this.prisma.cJOrderMapping.update({
        where: { id: mapping.id },
        data: {
          status: orderStatus,
          trackNumber: trackNumber,
        },
      });
      
      await this.prisma.order.update({
        where: { id: mapping.orderId },
        data: {
          status: this.mapCJStatusToKamri(orderStatus),
        },
      });
    }
  }

  /**
   * Gérer le webhook de produit
   */
  private async handleProductWebhook(payload: CJWebhookPayload): Promise<void> {
    // Logique pour gérer les changements de produits
    this.logger.log('Webhook produit reçu:', payload.params);
  }

  /**
   * Gérer le webhook de logistique
   */
  private async handleLogisticsWebhook(payload: CJWebhookPayload): Promise<void> {
    // Logique pour gérer les mises à jour de tracking
    this.logger.log('Webhook logistique reçu:', payload.params);
  }

  /**
   * Configurer les webhooks
   */
  async configureWebhooks(enable: boolean): Promise<any> {
    try {
      const client = await this.initializeClient();
      const webhookUrl = process.env.CJ_WEBHOOK_URL || 'http://localhost:3001/api/cj-dropshipping/webhooks';
      
      if (enable) {
        return await client.configureWebhooks(webhookUrl, [
          'PRODUCT',
          'STOCK', 
          'ORDER',
          'LOGISTICS'
        ]);
      } else {
        return await client.configureWebhooks('', []);
      }
    } catch (error) {
      this.logger.error('Erreur lors de la configuration des webhooks:', error);
      throw error;
    }
  }

  /**
   * Obtenir les logs des webhooks
   */
  async getWebhookLogs(query: any): Promise<any[]> {
    return this.prisma.cJWebhookLog.findMany({
      where: query.type ? { type: query.type } : {},
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
    });
  }

  /**
   * Mapper le statut CJ vers KAMRI
   */
  private mapCJStatusToKamri(cjStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'PENDING',
      'PAID': 'CONFIRMED',
      'SHIPPED': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED',
    };
    
    return statusMap[cjStatus] || 'PENDING';
  }
}

