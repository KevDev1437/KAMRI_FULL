import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import { CJConfigService } from './cj-config.service';
import { CJFavoriteService } from './cj-favorite.service';
import { CJOrderService } from './cj-order.service';
import { CJProductService } from './cj-product.service';
import { CJWebhookService } from './cj-webhook.service';

@Injectable()
export class CJMainService {
  private readonly logger = new Logger(CJMainService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient,
    private cjConfigService: CJConfigService,
    private cjProductService: CJProductService,
    private cjFavoriteService: CJFavoriteService,
    private cjOrderService: CJOrderService,
    private cjWebhookService: CJWebhookService
  ) {}

  // ===== DÉLÉGATION VERS LES SERVICES SPÉCIALISÉS =====

  // Configuration
  async getConfig() {
    return this.cjConfigService.getConfig();
  }

  async updateConfig(data: any) {
    return this.cjConfigService.updateConfig(data);
  }

  async testConnection() {
    return this.cjConfigService.testConnection();
  }

  async getConnectionStatus() {
    return this.cjConfigService.getConnectionStatus();
  }

  // Produits
  async getDefaultProducts(query: any) {
    return this.cjProductService.getDefaultProducts(query);
  }

  async searchProducts(query: any) {
    return this.cjProductService.searchProducts(query);
  }

  async getCategories() {
    return this.cjProductService.getCategories();
  }

  async getCategoriesTree() {
    return this.cjProductService.getCategoriesTree();
  }

  async syncCategories() {
    return this.cjProductService.syncCategories();
  }

  async getProductDetails(pid: string) {
    return this.cjProductService.getProductDetails(pid);
  }

  async getImportedProducts(filters?: any) {
    return this.cjProductService.getImportedProducts(filters);
  }

  // Favoris
  async getMyProducts(params?: any) {
    return this.cjFavoriteService.getMyProducts(params);
  }

  async syncFavorites() {
    return this.cjFavoriteService.syncFavorites();
  }

  async importProduct(pid: string, categoryId?: string, margin: number = 0, isFavorite: boolean = false) {
    return this.cjFavoriteService.importProduct(pid, categoryId, margin, isFavorite);
  }

  // Commandes
  async createOrder(orderData: any) {
    return this.cjOrderService.createOrder(orderData);
  }

  async getOrderStatus(orderId: string) {
    return this.cjOrderService.getOrderStatus(orderId);
  }

  async syncOrderStatuses() {
    return this.cjOrderService.syncOrderStatuses();
  }

  async calculateShipping(data: any) {
    return this.cjOrderService.calculateShipping(data);
  }

  async getTracking(trackNumber: string) {
    return this.cjOrderService.getTracking(trackNumber);
  }

  // Webhooks
  async handleWebhook(type: string, payload: any) {
    return this.cjWebhookService.handleWebhook(type, payload);
  }

  async configureWebhooks(enable: boolean) {
    return this.cjWebhookService.configureWebhooks(enable);
  }

  async getWebhookLogs(query: any) {
    return this.cjWebhookService.getWebhookLogs(query);
  }

  // ===== MÉTHODES MANQUANTES (pour compatibilité) =====
  
  async syncProducts(filters?: any) {
    // Délégation vers le service de produits
    return this.cjProductService.syncProducts ? this.cjProductService.syncProducts(filters) : { synced: 0, errors: 0 };
  }

  async getInventory(vid: string) {
    // Délégation vers le service de produits
    return this.cjProductService.getInventory ? this.cjProductService.getInventory(vid) : { success: false, stock: [] };
  }

  async syncInventory(productIds: string[]) {
    // Délégation vers le service de produits
    return this.cjProductService.syncInventory ? this.cjProductService.syncInventory(productIds) : { updated: 0, errors: 0 };
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Obtenir les statistiques
   */
  async getStats(): Promise<any> {
    const productMappings = await this.prisma.cJProductMapping.count();
    const orderMappings = await this.prisma.cJOrderMapping.count();
    const webhookLogs = await this.prisma.cJWebhookLog.count();
    const recentWebhooks = await this.prisma.cJWebhookLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
        },
      },
    });

    const syncedProducts = await this.prisma.cJProductMapping.count({
      where: { lastSyncAt: { not: null } },
    });

    const activeOrders = await this.prisma.cJOrderMapping.count({
      where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
    });

    return {
      products: {
        total: productMappings,
        synced: syncedProducts,
      },
      orders: {
        total: orderMappings,
        active: activeOrders,
      },
      webhooks: {
        total: webhookLogs,
        recent: recentWebhooks,
      },
    };
  }

  /**
   * Statistiques des produits
   */
  async getProductStats(): Promise<any> {
    return {
      synced: await this.prisma.cJProductMapping.count({
        where: {
          lastSyncAt: {
            not: null,
          },
        },
      }),
    };
  }

  /**
   * Statistiques des commandes
   */
  async getOrderStats(): Promise<any> {
    return {
      active: await this.prisma.cJOrderMapping.count({
        where: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED'],
          },
        },
      }),
    };
  }

  /**
   * Statistiques des webhooks
   */
  async getWebhookStats(): Promise<any> {
    return {
      processed: await this.prisma.cJWebhookLog.count({
        where: { processed: true },
      }),
      failed: await this.prisma.cJWebhookLog.count({
        where: { 
          processed: false,
          error: { not: null },
        },
      }),
    };
  }
}

