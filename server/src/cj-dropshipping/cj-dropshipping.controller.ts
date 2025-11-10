import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Query,
    Req,
    Sse,
    MessageEvent
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
// 🔧 ANCIEN SERVICE SUPPRIMÉ - Remplacé par CJMainService
import { UpdateCJConfigDto } from './dto/cj-config.dto';
import { CJOrderCreateDto } from './dto/cj-order-create.dto';
import { CJProductSearchDto } from './dto/cj-product-search.dto';
import { CJWebhookDto } from './dto/cj-webhook.dto';
import { CJWebhookPayload } from './interfaces/cj-webhook.interface';
import { CJSyncProgressEvent, CJSyncResult } from './interfaces/cj-sync-progress.interface';
// 🔧 NOUVEAUX SERVICES REFACTORISÉS
import { CJMainService } from './services/cj-main.service';
import { CJWebhookService } from './services/cj-webhook.service';

@ApiTags('cj-dropshipping')
@Controller('api/cj-dropshipping')
// @UseGuards(JwtAuthGuard) // Temporairement désactivé pour les tests
// @ApiBearerAuth()
export class CJDropshippingController {
  private readonly logger = new Logger(CJDropshippingController.name);
  
  constructor(
    private readonly cjMainService: CJMainService, // 🔧 SERVICE REFACTORISÉ
    private readonly cjWebhookService: CJWebhookService, // ✅ SERVICE WEBHOOK
    private readonly prisma: PrismaService
  ) {}

  // ===== CONFIGURATION =====

  @Get('config')
  @ApiOperation({ summary: 'Obtenir la configuration CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée avec succès' })
  async getConfig() {
    return this.cjMainService.getConfig();
  }

  @Get('config/status')
  @ApiOperation({ summary: 'Obtenir le statut de connexion CJ' })
  @ApiResponse({ status: 200, description: 'Statut de connexion récupéré' })
  async getConnectionStatus() {
    try {
      const status = await this.cjMainService.getConnectionStatus();
      return status;
    } catch (error) {
      this.logger.error(`❌ Erreur récupération statut: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      return {
        connected: false,
        tier: 'free',
        lastSync: null,
        apiLimits: {
          qps: '1 req/s',
          loginPer5min: 1,
          refreshPerMin: 5
        },
        tips: ['CJ non configuré']
      };
    }
  }

  @Put('config')
  @ApiOperation({ summary: 'Mettre à jour la configuration CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour avec succès' })
  async updateConfig(@Body() dto: UpdateCJConfigDto) {
    return this.cjMainService.updateConfig(dto);
  }

  @Post('config/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester la connexion CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Test de connexion effectué' })
  async testConnection() {
    return this.cjMainService.testConnection();
  }


  @Get('status')
  @ApiOperation({ summary: 'Obtenir le statut de connexion CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Statut récupéré avec succès' })
  async getStatus() {
    return this.cjMainService.getConnectionStatus();
  }


  // ===== CATÉGORIES =====
  // Les endpoints de catégories sont maintenant gérés par CJCategoriesController
  // pour une meilleure séparation des responsabilités

  // ===== PRODUITS =====

  @Get('products/default')
  @ApiOperation({ summary: 'Obtenir les produits CJ par défaut' })
  @ApiResponse({ status: 200, description: 'Liste des produits par défaut' })
  async getDefaultProducts(@Query() query: { pageNum?: number; pageSize?: number; countryCode?: string }) {
    this.logger.log('🔍 === DÉBUT CONTROLLER getDefaultProducts ===');
    this.logger.log('📝 Query reçue:', JSON.stringify(query, null, 2));
    
    try {
      const result = await this.cjMainService.getDefaultProducts(query);
      this.logger.log('✅ Controller getDefaultProducts terminé avec succès');
      this.logger.log('📊 Nombre de produits retournés:', result.length);
      this.logger.log('🔍 === FIN CONTROLLER getDefaultProducts ===');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER getDefaultProducts ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('📊 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 === FIN ERREUR CONTROLLER getDefaultProducts ===');
      
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      };
    }
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Rechercher des produits CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Liste des produits trouvés' })
  async searchProducts(@Query() query: CJProductSearchDto) {
    this.logger.log('🔍 === DÉBUT CONTROLLER searchProducts ===');
    this.logger.log('📝 Query reçue:', JSON.stringify(query, null, 2));
    
    try {
      const result = await this.cjMainService.searchProducts(query);
      this.logger.log('✅ Controller searchProducts terminé avec succès');
      this.logger.log('📊 Nombre de produits retournés:', result.products?.length || 0);
      this.logger.log('📊 Total disponible:', result.total || 0);
      this.logger.log('🔍 === FIN CONTROLLER searchProducts ===');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER searchProducts ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('📊 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 === FIN ERREUR CONTROLLER searchProducts ===');
      
      // ✅ CORRECTION: Rethrow l'erreur au lieu de retourner un objet
      throw error;
    }
  }


  @Post('products/:pid/import')
  @ApiOperation({ summary: 'Importer un produit CJ vers KAMRI' })
  @ApiResponse({ status: 201, description: 'Produit importé avec succès' })
  async importProduct(
    @Param('pid') pid: string,
    @Body() body: { categoryId?: string; margin?: number }
  ) {
    return this.cjMainService.importProduct(pid, body.categoryId, body.margin || 0);
  }

  @Post('products/sync')
  @ApiOperation({ summary: 'Synchroniser tous les produits CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation effectuée' })
  async syncProducts(@Body() filters?: any) {
    return this.cjMainService.syncProducts(filters);
  }

  @Get('products/:pid/details')
  @ApiOperation({ summary: 'Obtenir les détails complets d\'un produit CJ' })
  @ApiResponse({ status: 200, description: 'Détails du produit avec variants, stock, images' })
  async getProductDetails(@Param('pid') pid: string) {
    this.logger.log('🔍 === DÉBUT CONTROLLER getProductDetails ===');
    this.logger.log('📝 PID:', pid);
    
    try {
      const result = await this.cjMainService.getProductDetails(pid);
      this.logger.log('✅ Controller getProductDetails terminé avec succès');
      this.logger.log('🔍 === FIN CONTROLLER getProductDetails ===');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER getProductDetails ===');
      this.logger.error('💥 Erreur:', error);
      this.logger.error('🔍 === FIN ERREUR CONTROLLER getProductDetails ===');
      throw error;
    }
  }

  @Get('products/:pid/variant-stock')
  @ApiOperation({ summary: 'Obtenir le stock des variantes d\'un produit CJ' })
  @ApiResponse({ status: 200, description: 'Stock des variantes' })
  async getProductVariantStock(
    @Param('pid') pid: string,
    @Query('variantId') variantId?: string,
    @Query('countryCode') countryCode?: string
  ) {
    this.logger.log('🔍 === DÉBUT CONTROLLER getProductVariantStock ===');
    this.logger.log('📝 Paramètres:', { pid, variantId, countryCode });
    
    try {
      const result = await this.cjMainService.getProductVariantStock(pid, variantId, countryCode);
      this.logger.log('✅ Controller getProductVariantStock terminé avec succès');
      this.logger.log('🔍 === FIN CONTROLLER getProductVariantStock ===');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER getProductVariantStock ===');
      this.logger.error('💥 Erreur:', error);
      this.logger.error('🔍 === FIN ERREUR CONTROLLER getProductVariantStock ===');
      throw error;
    }
  }

  // ===== GESTION DU CACHE =====

  @Get('cache/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques du cache CJ' })
  @ApiResponse({ status: 200, description: 'Statistiques du cache' })
  async getCacheStats() {
    this.logger.log('📊 Récupération des statistiques du cache');
    try {
      const stats = await this.cjMainService.getCacheStats();
      this.logger.log('✅ Statistiques du cache récupérées');
      return {
        success: true,
        data: stats,
        message: '📊 Statistiques du cache récupérées'
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des stats cache:', error);
      throw error;
    }
  }

  @Post('cache/clean')
  @ApiOperation({ summary: 'Nettoyer le cache expiré CJ' })
  @ApiResponse({ status: 200, description: 'Cache nettoyé' })
  async cleanCache() {
    this.logger.log('🧹 Nettoyage du cache expiré');
    try {
      await this.cjMainService.cleanExpiredCache();
      this.logger.log('✅ Cache nettoyé avec succès');
      return {
        success: true,
        message: '🧹 Cache expiré nettoyé avec succès'
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors du nettoyage du cache:', error);
      throw error;
    }
  }

  // ===== INVENTAIRE =====

  @Get('inventory/:vid')
  @ApiOperation({ summary: 'Obtenir le stock d\'une variante CJ' })
  @ApiResponse({ status: 200, description: 'Informations de stock' })
  async getInventory(@Param('vid') vid: string) {
    return this.cjMainService.getInventory(vid);
  }

  @Post('inventory/sync')
  @ApiOperation({ summary: 'Synchroniser l\'inventaire des produits CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation de l\'inventaire effectuée' })
  async syncInventory(@Body() body: { productIds?: string[] }) {
    return this.cjMainService.syncInventory(body.productIds || []);
  }

  // ===== COMMANDES =====

  @Post('orders')
  @ApiOperation({ summary: 'Créer une commande CJ Dropshipping' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès' })
  async createOrder(@Body() dto: CJOrderCreateDto) {
    return this.cjMainService.createOrder(dto);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Obtenir le statut d\'une commande CJ' })
  @ApiResponse({ status: 200, description: 'Statut de la commande' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.cjMainService.getOrderStatus(orderId);
  }

  @Post('orders/sync')
  @ApiOperation({ summary: 'Synchroniser les statuts des commandes CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation des commandes effectuée' })
  async syncOrderStatuses() {
    return this.cjMainService.syncOrderStatuses();
  }

  // ===== LOGISTIQUE =====

  @Post('logistics/calculate')
  @ApiOperation({ summary: 'Calculer les frais de port' })
  @ApiResponse({ status: 200, description: 'Frais de port calculés' })
  async calculateShipping(@Body() data: any) {
    return this.cjMainService.calculateShipping(data);
  }

  @Get('logistics/tracking/:trackNumber')
  @ApiOperation({ summary: 'Obtenir le tracking d\'un colis' })
  @ApiResponse({ status: 200, description: 'Informations de tracking' })
  async getTracking(@Param('trackNumber') trackNumber: string) {
    return this.cjMainService.getTracking(trackNumber);
  }

  // ===== WEBHOOKS =====

  @Get('webhooks')
  @ApiOperation({ summary: 'Endpoint de test pour CJ Dropshipping (vérification URL)' })
  @ApiResponse({ status: 200, description: 'Endpoint accessible' })
  async testWebhookEndpoint(@Req() request: Request) {
    this.logger.log('✅ Test endpoint webhook appelé par CJ Dropshipping');
    return {
      code: 200,
      result: true,
      message: 'Webhook endpoint is accessible',
      data: {
        endpoint: '/api/cj-dropshipping/webhooks',
        method: 'POST',
        status: 'ready'
      },
      requestId: 'test-' + Date.now()
    };
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.OK) // ✅ Réponse 200 OK requise par CJ
  @ApiOperation({ summary: 'Recevoir les webhooks CJ Dropshipping' })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook reçu et traité (format conforme CJ)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        result: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Success' },
        data: { type: 'object' },
        requestId: { type: 'string' }
      }
    }
  })
  async handleWebhook(@Body() dto: any, @Req() request: Request) {
    const startTime = Date.now();
    
    // ✅ Gérer les requêtes de test de CJ Dropshipping (sans body ou body vide)
    if (!dto || !dto.messageId) {
      this.logger.log('✅ Test de connexion webhook par CJ Dropshipping');
      return {
        code: 200,
        result: true,
        message: 'Webhook endpoint is ready',
        data: {
          endpoint: '/api/cj-dropshipping/webhooks',
          status: 'ready',
          timestamp: new Date().toISOString()
        },
        requestId: 'test-' + Date.now()
      };
    }
    
    // ✅ VALIDATION HTTPS STRICTE
    if (process.env.NODE_ENV === 'production' && request.protocol !== 'https') {
      this.logger.error('❌ Webhook reçu en HTTP (HTTPS requis)');
      return {
        code: 200,
        result: false,
        message: 'HTTPS required in production',
        data: null,
        requestId: dto.messageId || 'unknown'
      };
    }

    try {
      // Cast le type en CJWebhookPayload
      const payload: CJWebhookPayload = {
        messageId: dto.messageId,
        type: dto.type as any,
        params: dto.params
      };

      // ✅ Traitement via le service webhook amélioré
      const result = await this.cjWebhookService.processWebhook(payload);
      
      // ✅ Vérifier le timeout de 3 secondes
      const processingTime = Date.now() - startTime;
      if (processingTime > 3000) {
        this.logger.warn(`⚠️  Webhook traité en ${processingTime}ms (> 3s limite CJ)`);
      }

      this.logger.log(`✅ Webhook traité en ${processingTime}ms`);

      // ✅ FORMAT CONFORME À LA DOC CJ
      return {
        code: 200,
        result: true,
        message: 'Success',
        data: {
          messageId: payload.messageId,
          type: payload.type,
          processingTimeMs: processingTime,
          processed: true,
          details: result
        },
        requestId: payload.messageId
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('❌ Erreur traitement webhook:', error);

      // ✅ TOUJOURS RETOURNER 200 OK (requis par CJ)
      return {
        code: 200,
        result: false,
        message: error.message || 'Processing error',
        data: {
          messageId: dto.messageId,
          type: dto.type,
          processingTimeMs: processingTime,
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        requestId: dto.messageId
      };
    }
  }

  @Post('webhooks/configure')
  @ApiOperation({ 
    summary: 'Configurer les webhooks CJ Dropshipping',
    description: 'Active ou désactive les webhooks avec l\'URL de callback. Conforme à la doc CJ : POST /webhook/set'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enable: { 
          type: 'boolean', 
          description: 'Activer (true) ou désactiver (false) les webhooks',
          example: true
        },
        callbackUrl: { 
          type: 'string', 
          description: 'URL de callback HTTPS pour recevoir les webhooks',
          example: 'https://votre-domaine.com/api/cj-dropshipping/webhooks'
        },
        types: { 
          type: 'array', 
          items: { type: 'string', enum: ['product', 'stock', 'order', 'logistics'] },
          description: 'Types de webhooks à configurer (optionnel, tous par défaut)',
          example: ['product', 'stock', 'order', 'logistics']
        }
      },
      required: ['enable', 'callbackUrl']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhooks configurés avec succès',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        result: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhooks configured successfully' },
        data: { type: 'object' },
        requestId: { type: 'string' }
      }
    }
  })
  async configureWebhooks(
    @Body() config: { 
      enable: boolean; 
      callbackUrl?: string;
      types?: ('product' | 'stock' | 'order' | 'logistics')[];
    }
  ) {
    // Validation de l'URL : HTTPS obligatoire (même en local, CJ Dropshipping exige HTTPS)
    // Pour tester en local, utilisez un tunnel HTTPS (ngrok, Cloudflare Tunnel, etc.)
    if (config.enable) {
      if (!config.callbackUrl) {
        return {
          code: 200,
          result: false,
          message: 'Callback URL is required when enabling webhooks',
          data: {
            error: 'Callback URL is required',
            suggestion: 'Please provide a callbackUrl in the request body'
          },
          requestId: 'config-validation-' + Date.now()
        };
      }
      if (!config.callbackUrl.startsWith('https://')) {
        return {
          code: 200,
          result: false,
          message: 'Callback URL must use HTTPS protocol. CJ Dropshipping requires HTTPS even for local testing. Use ngrok or similar tunnel.',
          data: {
            error: 'HTTPS required by CJ Dropshipping API',
            suggestion: 'For local testing, use ngrok: ngrok http 3001'
          },
          requestId: 'config-validation-' + Date.now()
        };
      }
    }

    return this.cjWebhookService.configureWebhooks(
      config.enable,
      config.callbackUrl || '',
      config.types
    );
  }

  @Get('webhooks/status')
  @ApiOperation({ 
    summary: 'Obtenir le statut de configuration des webhooks',
    description: 'Récupère le statut actuel des webhooks (activé/désactivé, URL, types)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut des webhooks',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        result: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook status retrieved' },
        data: { 
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            configured: { type: 'boolean' },
            callbackUrl: { type: 'string' },
            types: { type: 'array', items: { type: 'string' } },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        },
        requestId: { type: 'string' }
      }
    }
  })
  async getWebhookStatus() {
    return this.cjWebhookService.getWebhookStatus();
  }

  @Get('webhooks/logs')
  @ApiOperation({ 
    summary: 'Obtenir les logs des webhooks reçus',
    description: 'Liste tous les webhooks reçus avec leur statut de traitement'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrer par type (PRODUCT, VARIANT, STOCK, ORDER, etc.)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut (RECEIVED, PROCESSED, ERROR)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats (défaut: 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset pour pagination (défaut: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logs des webhooks',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        result: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook logs retrieved' },
        data: { 
          type: 'object',
          properties: {
            logs: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        },
        requestId: { type: 'string' }
      }
    }
  })
  async getWebhookLogs(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.cjWebhookService.getWebhookLogs({
      type,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });
  }

  // ===== STATISTIQUES =====

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getStats() {
    return this.cjMainService.getStats();
  }

  @Post('sync-favorites')
  @ApiOperation({ summary: 'Synchroniser les favoris CJ avec KAMRI' })
  @ApiResponse({ status: 200, description: 'Favoris synchronisés avec succès' })
  async syncFavorites() {
    try {
      const result = await this.cjMainService.syncFavorites();
      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur synchronisation favoris: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      return {
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: `Erreur lors de la synchronisation des favoris: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Synchroniser les favoris CJ avec progression en temps réel (SSE)
   * @returns Observable d'événements de progression
   */
  @Sse('sync-favorites-progress')
  @ApiOperation({ summary: 'Synchroniser les favoris CJ avec progression en temps réel (SSE)' })
  @ApiResponse({ status: 200, description: 'Stream d\'événements de progression' })
  async syncFavoritesWithProgress(): Promise<Observable<MessageEvent>> {
    this.logger.log('📡 === DÉBUT SSE SYNC FAVORIS CJ ===');
    
    return new Observable((observer) => {
      // Accéder au service via CJMainService
      const favoriteService = (this.cjMainService as any).cjFavoriteService;
      
      favoriteService.syncFavoritesWithProgress((event: CJSyncProgressEvent) => {
        // Envoyer l'événement de progression au client
        observer.next({
          data: event
        } as MessageEvent);
      })
      .then((result: CJSyncResult) => {
        // Envoyer le résultat final
        observer.next({
          data: result
        } as MessageEvent);
        
        this.logger.log('✅ SSE sync favoris terminé avec succès');
        observer.complete();
      })
      .catch((error) => {
        this.logger.error('❌ Erreur SSE sync favoris:', error);
        
        observer.next({
          data: {
            done: true,
            success: false,
            synced: 0,
            failed: 0,
            total: 0,
            duration: 0,
            message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
          } as CJSyncResult
        } as MessageEvent);
        
        observer.error(error);
      });
    });
  }

  @Get('favorites/status')
  @ApiOperation({ summary: 'Vérifier le statut des favoris CJ' })
  @ApiResponse({ status: 200, description: 'Statut des favoris récupéré' })
  async getFavoritesStatus() {
    try {
      this.logger.log('🔍 Vérification du statut des favoris CJ...');
      
      // Récupérer les favoris depuis la base de données (requête SQL directe)
      const favorites = await this.prisma.$queryRaw`
        SELECT * FROM cj_product_store 
        WHERE isFavorite = 1 
        ORDER BY createdAt DESC
      `;
      
      const favoritesArray = favorites as any[];
      this.logger.log(`✅ ${favoritesArray.length} favoris trouvés en base`);
      
      return {
        success: true,
        count: favoritesArray.length,
        favorites: favoritesArray.map(fav => ({
          id: fav.id,
          name: fav.name,
          cjProductId: fav.cjProductId,
          status: fav.status,
          createdAt: fav.createdAt
        }))
      };
    } catch (error) {
      this.logger.error(`❌ Erreur vérification favoris: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        count: 0,
        favorites: []
      };
    }
  }


  @Get('products/imported-favorites')
  @ApiOperation({ summary: 'Récupérer les produits CJ favoris importés' })
  @ApiResponse({ status: 200, description: 'Produits favoris importés récupérés' })
  async getImportedFavorites() {
    try {
      const products = await this.cjMainService.getImportedProducts({ isFavorite: true });
      return products;
    } catch (error) {
      this.logger.error(`❌ Erreur récupération produits favoris: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      return [];
    }
  }

  @Get('stats/products')
  @ApiOperation({ summary: 'Statistiques des produits' })
  @ApiResponse({ status: 200, description: 'Statistiques produits' })
  async getProductStats() {
    return this.cjMainService.getProductStats();
  }

  @Get('stats/orders')
  @ApiOperation({ summary: 'Statistiques des commandes' })
  @ApiResponse({ status: 200, description: 'Statistiques commandes' })
  async getOrderStats() {
    return this.cjMainService.getOrderStats();
  }

  @Get('stats/webhooks')
  @ApiOperation({ summary: 'Statistiques des webhooks' })
  @ApiResponse({ status: 200, description: 'Statistiques webhooks' })
  async getWebhookStats() {
    return this.cjMainService.getWebhookStats();
  }

  @Get('stores/:storeId/products')
  @ApiOperation({ summary: 'Récupérer les produits d\'un magasin CJ depuis la base de données' })
  @ApiResponse({ status: 200, description: 'Produits du magasin récupérés' })
  async getStoreProducts(@Param('storeId') storeId: string, @Query() query: any) {
    try {
      this.logger.log(`🔍 Récupération des produits du magasin ${storeId} depuis la base de données...`);
      
      // Construire les filtres
      const whereClause: any = {};
      
      // Filtre par statut
      if (query.status && query.status !== 'all') {
        whereClause.status = query.status;
      }
      
      // Filtre par catégorie
      if (query.category && query.category !== 'all') {
        whereClause.category = { contains: query.category };
      }
      
      // Filtre par recherche
      if (query.search) {
        whereClause.OR = [
          { name: { contains: query.search } },
          { description: { contains: query.search } },
          { category: { contains: query.search } }
        ];
      }
      
      // Récupérer les produits depuis la base de données
      const products = await this.prisma.cJProductStore.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      
      // Récupérer les catégories uniques
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      
      this.logger.log(`✅ ${products.length} produits récupérés depuis la base de données`);
      
      return {
        products: products.map(product => ({
          id: product.id,
          cjProductId: product.cjProductId,
          name: product.name,
          description: product.description || '',
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        })),
        categories
      };
    } catch (error) {
      this.logger.error(`❌ Erreur récupération produits magasin: ${error instanceof Error ? error.message : String(error)}`);
      return {
        products: [],
        categories: []
      };
    }
  }

  // ===== CATÉGORIES =====

  @Get('categories')
  @ApiOperation({ summary: 'Obtenir toutes les catégories CJ' })
  @ApiResponse({ status: 200, description: 'Liste des catégories' })
  async getCategories() {
    return this.cjMainService.getCategories();
  }

  @Get('categories/tree')
  @ApiOperation({ summary: 'Obtenir l\'arbre des catégories CJ' })
  @ApiResponse({ status: 200, description: 'Arbre des catégories' })
  async getCategoriesTree() {
    return this.cjMainService.getCategoriesTree();
  }

  @Post('categories/sync')
  @ApiOperation({ summary: 'Synchroniser les catégories CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation des catégories effectuée' })
  async syncCategories() {
    return this.cjMainService.syncCategories();
  }

  // ===== CATÉGORIES AVANCÉES =====

  @Get('categories/search')
  @ApiOperation({ summary: 'Recherche avancée de catégories avec filtres et pagination' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche de catégories' })
  async searchCategories(@Query() query: any) {
    this.logger.log('🔍 === DÉBUT CONTROLLER searchCategories ===');
    this.logger.log('📝 Paramètres:', query);
    
    try {
      const result = await this.cjMainService.searchCategories(query);
      this.logger.log('✅ Controller searchCategories terminé avec succès');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER searchCategories ===');
      this.logger.error('💥 Erreur:', error);
      throw error;
    }
  }

  @Get('categories/popular')
  @ApiOperation({ summary: 'Obtenir les catégories populaires' })
  @ApiResponse({ status: 200, description: 'Liste des catégories populaires' })
  async getPopularCategories(@Query('limit') limit?: number) {
    this.logger.log(`🔥 Récupération des catégories populaires (limit: ${limit || 10})`);
    
    try {
      const result = await this.cjMainService.getPopularCategories(limit || 10);
      this.logger.log('✅ Catégories populaires récupérées');
      return result;
    } catch (error) {
      this.logger.error('❌ Erreur catégories populaires:', error);
      throw error;
    }
  }

  @Get('categories/:parentId/subcategories')
  @ApiOperation({ summary: 'Obtenir les sous-catégories d\'une catégorie parent' })
  @ApiResponse({ status: 200, description: 'Liste des sous-catégories' })
  async getSubCategories(@Param('parentId') parentId: string) {
    this.logger.log(`📂 Récupération des sous-catégories pour ${parentId}`);
    
    try {
      const result = await this.cjMainService.getSubCategories(parentId);
      this.logger.log('✅ Sous-catégories récupérées');
      return result;
    } catch (error) {
      this.logger.error('❌ Erreur sous-catégories:', error);
      throw error;
    }
  }

  @Get('categories/:categoryId/path')
  @ApiOperation({ summary: 'Obtenir le chemin complet d\'une catégorie (breadcrumb)' })
  @ApiResponse({ status: 200, description: 'Chemin de la catégorie' })
  async getCategoryPath(@Param('categoryId') categoryId: string) {
    this.logger.log(`🗂️ Récupération du chemin pour la catégorie ${categoryId}`);
    
    try {
      const result = await this.cjMainService.getCategoryPath(categoryId);
      this.logger.log('✅ Chemin de catégorie récupéré');
      return result;
    } catch (error) {
      this.logger.error('❌ Erreur chemin catégorie:', error);
      throw error;
    }
  }

}

