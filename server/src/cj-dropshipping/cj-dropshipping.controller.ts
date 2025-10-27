import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Query
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
// 🔧 ANCIEN SERVICE SUPPRIMÉ - Remplacé par CJMainService
import { UpdateCJConfigDto } from './dto/cj-config.dto';
import { CJOrderCreateDto } from './dto/cj-order-create.dto';
import { CJProductSearchDto } from './dto/cj-product-search.dto';
import { CJWebhookDto } from './dto/cj-webhook.dto';
import { CJWebhookPayload } from './interfaces/cj-webhook.interface';
// 🔧 NOUVEAUX SERVICES REFACTORISÉS
import { CJMainService } from './services/cj-main.service';

@ApiTags('cj-dropshipping')
@Controller('api/cj-dropshipping')
// @UseGuards(JwtAuthGuard) // Temporairement désactivé pour les tests
// @ApiBearerAuth()
export class CJDropshippingController {
  private readonly logger = new Logger(CJDropshippingController.name);
  
  constructor(
    private readonly cjMainService: CJMainService, // 🔧 SERVICE REFACTORISÉ
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
      this.logger.log('📊 Nombre de produits retournés:', result.length);
      this.logger.log('🔍 === FIN CONTROLLER searchProducts ===');
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CONTROLLER searchProducts ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('📊 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 === FIN ERREUR CONTROLLER searchProducts ===');
      
      // Retourner une réponse d'erreur structurée au lieu de throw
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error
      };
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

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recevoir les webhooks CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Webhook traité' })
  async handleWebhook(@Body() dto: CJWebhookDto) {
    // Cast le type en CJWebhookPayload
    const payload: CJWebhookPayload = {
      type: dto.type as 'PRODUCT' | 'VARIANT' | 'STOCK' | 'ORDER' | 'LOGISTIC' | 'SOURCINGCREATE' | 'ORDERSPLIT',
      messageId: dto.messageId,
      params: dto.params,
    };
    return this.cjMainService.handleWebhook(payload.type, payload);
  }

  @Post('webhooks/configure')
  @ApiOperation({ summary: 'Configurer les webhooks CJ' })
  @ApiResponse({ status: 200, description: 'Webhooks configurés' })
  async configureWebhooks(@Body() body: { enable: boolean }) {
    return this.cjMainService.configureWebhooks(body.enable);
  }

  @Get('webhooks/logs')
  @ApiOperation({ summary: 'Obtenir les logs des webhooks' })
  @ApiResponse({ status: 200, description: 'Logs des webhooks' })
  async getWebhookLogs(@Query() query: any) {
    return this.cjMainService.getWebhookLogs(query);
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
        message: `Erreur lors de la synchronisation des favoris: ${error instanceof Error ? error.message : String(error)}`
      };
    }
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

  // ===== DÉTAILS PRODUIT =====

  @Get('products/:pid/details')
  @ApiOperation({ summary: 'Obtenir les détails complets d\'un produit CJ' })
  @ApiResponse({ status: 200, description: 'Détails du produit récupérés' })
  async getProductDetails(@Param('pid') pid: string) {
    try {
      this.logger.log(`🔍 === DÉBUT CONTROLLER getProductDetails ===`);
      this.logger.log(`📝 PID reçu: ${pid}`);
      
      const productDetails = await this.cjMainService.getProductDetails(pid);
      
      this.logger.log(`✅ Controller getProductDetails terminé avec succès`);
      this.logger.log(`📊 Données retournées:`, {
        pid: productDetails.pid,
        name: productDetails.productName,
        sku: productDetails.productSku,
        price: productDetails.sellPrice,
        hasImage: !!productDetails.productImage,
        variantsCount: productDetails.variants?.length || 0,
        reviewsCount: productDetails.reviews?.length || 0
      });
      this.logger.log(`🔍 === FIN CONTROLLER getProductDetails ===`);
      
      return productDetails;
    } catch (error) {
      this.logger.error(`❌ Erreur controller getProductDetails: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }
}

