import { Injectable, Logger } from '@nestjs/common';
import { DuplicatePreventionService } from '../../common/services/duplicate-prevention.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import {
    CJOrderParams,
    CJOrderSplitParams,
    CJProductParams,
    CJSourcingCreateParams,
    CJStockParams,
    CJVariantParams,
    CJWebhookPayload,
    WebhookProcessingResult
} from '../interfaces/cj-webhook.interface';

@Injectable()
export class CJWebhookService {
  private readonly logger = new Logger(CJWebhookService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient,
    private duplicatePreventionService: DuplicatePreventionService
  ) {}

  /**
   * Traiter un webhook CJ selon son type
   */
  async processWebhook(payload: CJWebhookPayload): Promise<WebhookProcessingResult> {
    const startTime = Date.now();
    this.logger.log(`🎯 Traitement webhook ${payload.type} [${payload.messageId}]`);

    try {
      // Vérifier que l'intégration est activée
      const config = await this.prisma.cJConfig.findFirst();
      if (!config?.enabled) {
        throw new Error('L\'intégration CJ Dropshipping est désactivée');
      }

      // Enregistrer le webhook reçu
      await this.logWebhookReceived(payload);

      let result: WebhookProcessingResult;

      // Router selon le type de webhook
      switch (payload.type) {
        case 'PRODUCT':
          result = await this.handleProductWebhook(payload.params as CJProductParams, payload.messageId);
          break;
        
        case 'VARIANT':
          result = await this.handleVariantWebhook(payload.params as CJVariantParams, payload.messageId);
          break;

        case 'STOCK':
          result = await this.handleStockWebhook(payload.params as CJStockParams, payload.messageId);
          break;

        case 'ORDER':
          result = await this.handleOrderWebhook(payload.params as CJOrderParams, payload.messageId);
          break;

        case 'ORDERSPLIT':
          result = await this.handleOrderSplitWebhook(payload.params as CJOrderSplitParams, payload.messageId);
          break;

        case 'SOURCINGCREATE':
          result = await this.handleSourcingCreateWebhook(payload.params as CJSourcingCreateParams, payload.messageId);
          break;
        
        default:
          this.logger.warn(`⚠️  Type de webhook non géré: ${payload.type}`);
          result = {
            success: false,
            messageId: payload.messageId,
            type: payload.type,
            processedAt: new Date(),
            error: `Type de webhook non supporté: ${payload.type}`
          };
      }

      // Mesurer le temps de traitement
      const processingTime = Date.now() - startTime;
      this.logger.log(`✅ Webhook ${payload.type} traité en ${processingTime}ms [${payload.messageId}]`);

      // Enregistrer le résultat
      await this.logWebhookProcessed(payload.messageId, result, processingTime);

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur traitement webhook ${payload.type} [${payload.messageId}]:`, errorMessage);
      
      const result: WebhookProcessingResult = {
        success: false,
        messageId: payload.messageId,
        type: payload.type,
        processedAt: new Date(),
        error: errorMessage
      };

      await this.logWebhookProcessed(payload.messageId, result, processingTime);
      return result;
    }
  }

  /**
   * Gérer les webhooks de type PRODUCT
   */
  private async handleProductWebhook(params: CJProductParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`📦 Traitement produit CJ: ${params.pid}`);
    this.logger.log(`🔄 Champs modifiés: ${params.fields.join(', ')}`);

    try {
      // Utiliser le service anti-doublons pour l'upsert intelligent
      const duplicateCheck = await this.duplicatePreventionService.checkCJProductDuplicate(params.pid);
      
      const upsertResult = await this.duplicatePreventionService.upsertCJProduct({
        cjProductId: params.pid,
        name: params.productName || params.productNameEn || `Produit CJ ${params.pid}`,
        description: params.productDescription,
        price: params.productSellPrice,
        sku: params.productSku,
        status: params.productStatus,
        categoryId: params.categoryId,
        categoryName: params.categoryName,
        image: params.productImage,
        properties: {
          property1: params.productProperty1,
          property2: params.productProperty2,
          property3: params.productProperty3,
        },
        modifiedFields: params.fields
      }, duplicateCheck);

      return {
        success: true,
        messageId,
        type: 'PRODUCT',
        processedAt: new Date(),
        changes: params.fields,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur traitement produit ${params.pid}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Gérer les webhooks de type VARIANT
   */
  private async handleVariantWebhook(params: CJVariantParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`🔧 Traitement variante CJ: ${params.vid}`);
    this.logger.log(`🔄 Champs modifiés: ${params.fields.join(', ')}`);

    try {
      // Trouver le produit parent par la variante
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          productVariants: {
            some: {
              cjVariantId: params.vid
            }
          }
        },
        include: {
          productVariants: true
        }
      });

      if (!existingProduct) {
        this.logger.warn(`⚠️  Produit parent introuvable pour variante ${params.vid}`);
        return {
          success: false,
          messageId,
          type: 'VARIANT',
          processedAt: new Date(),
          error: `Produit parent introuvable pour variante ${params.vid}`
        };
      }

      // Mettre à jour ou créer la variante
      const variantData = {
        name: params.variantName,
        sku: params.variantSku,
        price: params.variantSellPrice,
        weight: params.variantWeight,
        dimensions: params.variantLength || params.variantWidth || params.variantHeight ? 
          JSON.stringify({
            length: params.variantLength,
            width: params.variantWidth,
            height: params.variantHeight
          }) : null,
        image: params.variantImage,
        status: params.variantStatus,
        properties: JSON.stringify({
          key: params.variantKey,
          value1: params.variantValue1,
          value2: params.variantValue2,
          value3: params.variantValue3,
        }),
        cjVariantId: params.vid,
      };

      // Upsert de la variante
      const variant = await this.prisma.productVariant.upsert({
        where: {
          cjVariantId: params.vid
        },
        update: variantData,
        create: {
          ...variantData,
          product: {
            connect: { id: existingProduct.id }
          }
        }
      });

      this.logger.log(`✅ Variante ${params.vid} mise à jour: ${variant.id}`);

      return {
        success: true,
        messageId,
        type: 'VARIANT',
        processedAt: new Date(),
        changes: params.fields,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur traitement variante ${params.vid}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Gérer les webhooks de type STOCK
   */
  private async handleStockWebhook(params: CJStockParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`📦 Traitement stock CJ: ${Object.keys(params).length} variants`);

    try {
      let updatedVariants = 0;

      // Parcourir tous les variants avec leurs stocks
      for (const [vid, stockInfos] of Object.entries(params)) {
        this.logger.log(`🔧 Mise à jour stock variante: ${vid}`);

        // Calculer le stock total pour ce variant
        const totalStock = stockInfos.reduce((total, info) => total + info.storageNum, 0);

        // Mettre à jour le stock du variant
        try {
          await this.prisma.productVariant.updateMany({
            where: { cjVariantId: vid },
            data: { 
              stock: totalStock
            }
          });
          updatedVariants++;
        } catch (error) {
          this.logger.warn(`⚠️ Variant ${vid} non trouvé en base`);
        }
      }

      return {
        success: true,
        messageId,
        type: 'STOCK',
        processedAt: new Date(),
        changes: [`${updatedVariants} variants mis à jour`],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur traitement stock:`, errorMessage);
      throw error;
    }
  }

  /**
   * Gérer les webhooks de type ORDER
   */
  private async handleOrderWebhook(params: CJOrderParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`📋 Traitement commande CJ: ${params.orderNumber}`);

    try {
      // Trouver la commande correspondante via le mapping
      const mapping = await this.prisma.cJOrderMapping.findFirst({
        where: { cjOrderId: params.cjOrderId.toString() }
      });

      if (!mapping) {
        this.logger.warn(`⚠️ Commande CJ ${params.cjOrderId} non trouvée en mapping`);
        return {
          success: false,
          messageId,
          type: 'ORDER',
          processedAt: new Date(),
          error: `Commande ${params.cjOrderId} non trouvée`
        };
      }

      // Mapper le statut CJ vers KAMRI
      const kamriStatus = this.mapCJStatusToKamri(params.orderStatus);

      // Mettre à jour la commande
      await this.prisma.order.update({
        where: { id: mapping.orderId },
        data: {
          status: kamriStatus,
          ...(params.trackNumber && { trackingNumber: params.trackNumber })
        }
      });

      // Mettre à jour le mapping
      await this.prisma.cJOrderMapping.update({
        where: { id: mapping.id },
        data: {
          status: params.orderStatus,
          trackNumber: params.trackNumber
        }
      });

      this.logger.log(`✅ Commande ${params.orderNumber} mise à jour: ${kamriStatus}`);

      return {
        success: true,
        messageId,
        type: 'ORDER',
        processedAt: new Date(),
        changes: [`Statut: ${kamriStatus}`, ...(params.trackNumber ? [`Tracking: ${params.trackNumber}`] : [])],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur traitement commande ${params.orderNumber}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Gérer les webhooks de division de commande
   */
  private async handleOrderSplitWebhook(params: CJOrderSplitParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`🔀 Traitement division commande: ${params.originalOrderId}`);

    try {
      // Trouver la commande originale
      const originalMapping = await this.prisma.cJOrderMapping.findFirst({
        where: { cjOrderId: params.originalOrderId }
      });

      if (!originalMapping) {
        this.logger.warn(`⚠️ Commande originale ${params.originalOrderId} non trouvée`);
        return {
          success: false,
          messageId,
          type: 'ORDERSPLIT',
          processedAt: new Date(),
          error: `Commande originale ${params.originalOrderId} non trouvée`
        };
      }

      // Créer des mappings pour les commandes divisées
      const splitOrderCodes: string[] = [];
      for (const splitOrder of params.splitOrderList) {
        await this.prisma.cJOrderMapping.create({
          data: {
            orderId: originalMapping.orderId,
            cjOrderId: splitOrder.orderCode,
            cjOrderNumber: splitOrder.orderCode, // Ajouter le champ requis
            status: splitOrder.orderStatus.toString()
          }
        });
        splitOrderCodes.push(splitOrder.orderCode);
      }

      this.logger.log(`✅ Division commande créée: ${splitOrderCodes.length} sous-commandes`);

      return {
        success: true,
        messageId,
        type: 'ORDERSPLIT',
        processedAt: new Date(),
        changes: [`${splitOrderCodes.length} sous-commandes créées`],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur division commande:`, errorMessage);
      throw error;
    }
  }

  /**
   * Gérer les webhooks de création de sourcing
   */
  private async handleSourcingCreateWebhook(params: CJSourcingCreateParams, messageId: string): Promise<WebhookProcessingResult> {
    this.logger.log(`🎯 Traitement sourcing CJ: ${params.cjSourcingId}`);

    try {
      // Trouver le produit correspondant
      const product = await this.prisma.product.findFirst({
        where: { cjProductId: params.cjProductId }
      });

      if (!product) {
        this.logger.warn(`⚠️ Produit ${params.cjProductId} non trouvé pour sourcing`);
        return {
          success: false,
          messageId,
          type: 'SOURCINGCREATE',
          processedAt: new Date(),
          error: `Produit ${params.cjProductId} non trouvé`
        };
      }

      // Mettre à jour le produit avec les infos de sourcing
      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          description: product.description ? 
            `${product.description}\n\nCJ Sourcing: ${params.cjSourcingId} (${params.status})` :
            `CJ Sourcing: ${params.cjSourcingId} (${params.status})`,
          lastImportAt: new Date()
        }
      });

      this.logger.log(`✅ Sourcing ${params.cjSourcingId} appliqué au produit ${product.name}`);

      return {
        success: true,
        messageId,
        type: 'SOURCINGCREATE',
        processedAt: new Date(),
        changes: [`Sourcing ${params.status}: ${params.cjSourcingId}`],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur sourcing ${params.cjSourcingId}:`, errorMessage);
      throw error;
    }
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

  /**
   * Enregistrer la réception d'un webhook
   */
  private async logWebhookReceived(payload: CJWebhookPayload): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          messageId: payload.messageId,
          type: payload.type,
          payload: JSON.stringify(payload),
          status: 'RECEIVED',
          receivedAt: new Date(),
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error('❌ Erreur enregistrement webhook reçu:', errorMessage);
    }
  }

  /**
   * Enregistrer le résultat du traitement
   */
  private async logWebhookProcessed(
    messageId: string, 
    result: WebhookProcessingResult, 
    processingTimeMs: number
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.updateMany({
        where: { messageId },
        data: {
          status: result.success ? 'PROCESSED' : 'ERROR',
          processedAt: result.processedAt,
          processingTimeMs,
          error: result.error,
          result: JSON.stringify(result)
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error('❌ Erreur enregistrement résultat webhook:', errorMessage);
    }
  }

  /**
   * Gérer un webhook (pour compatibilité avec CJMainService)
   */
  async handleWebhook(type: string, payload: any): Promise<any> {
    const webhookPayload: CJWebhookPayload = {
      type: type as any,
      messageId: payload.messageId || `webhook_${Date.now()}`,
      params: payload
    };
    
    return this.processWebhook(webhookPayload);
  }

  /**
   * Configurer les webhooks (pour compatibilité avec CJMainService)
   */
  async configureWebhooks(enable: boolean): Promise<any> {
    this.logger.log(`📡 Configuration webhooks CJ: ${enable ? 'activé' : 'désactivé'}`);
    
    // Mettre à jour la configuration CJ - pour l'instant juste un flag enabled général
    const config = await this.prisma.cJConfig.findFirst();
    if (config) {
      await this.prisma.cJConfig.update({
        where: { id: config.id },
        data: { 
          enabled: enable, // Utiliser le champ enabled existant
          updatedAt: new Date()
        }
      });
    }

    return {
      success: true,
      webhooksEnabled: enable,
      message: `Webhooks ${enable ? 'activés' : 'désactivés'} avec succès`
    };
  }

  /**
   * Obtenir les logs de webhooks (pour compatibilité avec CJMainService)
   */
  async getWebhookLogs(query?: any): Promise<any> {
    const { 
      limit = 50, 
      offset = 0, 
      type, 
      status,
      since 
    } = query || {};

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (since) where.receivedAt = { gte: new Date(since) };

    // Utiliser le modèle WebhookLog correct avec la bonne casse
    const logs = await this.prisma.webhookLog.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await this.prisma.webhookLog.count({ where });

    return {
      logs,
      total,
      page: Math.floor(offset / limit) + 1,
      limit
    };
  }
}
