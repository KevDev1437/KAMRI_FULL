import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CJDropshippingService } from './cj-dropshipping.service';
import { UpdateCJConfigDto } from './dto/cj-config.dto';
import { CJOrderCreateDto } from './dto/cj-order-create.dto';
import { CJProductSearchDto } from './dto/cj-product-search.dto';
import { CJWebhookDto } from './dto/cj-webhook.dto';
import { CJWebhookPayload } from './interfaces/cj-webhook.interface';

@ApiTags('cj-dropshipping')
@Controller('api/cj-dropshipping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CJDropshippingController {
  constructor(private readonly cjService: CJDropshippingService) {}

  // ===== CONFIGURATION =====

  @Get('config')
  @ApiOperation({ summary: 'Obtenir la configuration CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée avec succès' })
  async getConfig() {
    return this.cjService.getConfig();
  }

  @Put('config')
  @ApiOperation({ summary: 'Mettre à jour la configuration CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour avec succès' })
  async updateConfig(@Body() dto: UpdateCJConfigDto) {
    return this.cjService.updateConfig(dto);
  }

  @Post('config/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester la connexion CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Test de connexion effectué' })
  async testConnection() {
    const success = await this.cjService.testConnection();
    return { success, message: success ? 'Connexion réussie' : 'Connexion échouée' };
  }

  // ===== PRODUITS =====

  @Get('products/search')
  @ApiOperation({ summary: 'Rechercher des produits CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Liste des produits trouvés' })
  async searchProducts(@Query() query: CJProductSearchDto) {
    return this.cjService.searchProducts(query);
  }

  @Get('products/:pid')
  @ApiOperation({ summary: 'Obtenir les détails d\'un produit CJ' })
  @ApiResponse({ status: 200, description: 'Détails du produit' })
  async getProductDetails(@Param('pid') pid: string) {
    return this.cjService.getProductDetails(pid);
  }

  @Post('products/:pid/import')
  @ApiOperation({ summary: 'Importer un produit CJ vers KAMRI' })
  @ApiResponse({ status: 201, description: 'Produit importé avec succès' })
  async importProduct(
    @Param('pid') pid: string,
    @Body() body: { categoryId?: string; margin?: number }
  ) {
    return this.cjService.importProduct(pid, body.categoryId, body.margin);
  }

  @Post('products/sync')
  @ApiOperation({ summary: 'Synchroniser tous les produits CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation effectuée' })
  async syncProducts(@Body() filters?: any) {
    return this.cjService.syncProducts(filters);
  }

  // ===== INVENTAIRE =====

  @Get('inventory/:vid')
  @ApiOperation({ summary: 'Obtenir le stock d\'une variante CJ' })
  @ApiResponse({ status: 200, description: 'Informations de stock' })
  async getInventory(@Param('vid') vid: string) {
    return this.cjService.getInventory(vid);
  }

  @Post('inventory/sync')
  @ApiOperation({ summary: 'Synchroniser l\'inventaire des produits CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation de l\'inventaire effectuée' })
  async syncInventory(@Body() body: { productIds?: string[] }) {
    return this.cjService.syncInventory(body.productIds || []);
  }

  // ===== COMMANDES =====

  @Post('orders')
  @ApiOperation({ summary: 'Créer une commande CJ Dropshipping' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès' })
  async createOrder(@Body() dto: CJOrderCreateDto) {
    return this.cjService.createOrder(dto);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Obtenir le statut d\'une commande CJ' })
  @ApiResponse({ status: 200, description: 'Statut de la commande' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.cjService.getOrderStatus(orderId);
  }

  @Post('orders/sync')
  @ApiOperation({ summary: 'Synchroniser les statuts des commandes CJ' })
  @ApiResponse({ status: 200, description: 'Synchronisation des commandes effectuée' })
  async syncOrderStatuses() {
    return this.cjService.syncOrderStatuses();
  }

  // ===== LOGISTIQUE =====

  @Post('logistics/calculate')
  @ApiOperation({ summary: 'Calculer les frais de port' })
  @ApiResponse({ status: 200, description: 'Frais de port calculés' })
  async calculateShipping(@Body() data: any) {
    return this.cjService.calculateShipping(data);
  }

  @Get('logistics/tracking/:trackNumber')
  @ApiOperation({ summary: 'Obtenir le tracking d\'un colis' })
  @ApiResponse({ status: 200, description: 'Informations de tracking' })
  async getTracking(@Param('trackNumber') trackNumber: string) {
    return this.cjService.getTracking(trackNumber);
  }

  // ===== WEBHOOKS =====

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recevoir les webhooks CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Webhook traité' })
  async handleWebhook(@Body() dto: CJWebhookDto) {
    // Cast le type en CJWebhookPayload
    const payload: CJWebhookPayload = {
      type: dto.type as 'PRODUCT' | 'STOCK' | 'ORDER' | 'LOGISTICS',
      messageId: dto.messageId,
      params: dto.params,
    };
    return this.cjService.handleWebhook(payload.type, payload);
  }

  @Post('webhooks/configure')
  @ApiOperation({ summary: 'Configurer les webhooks CJ' })
  @ApiResponse({ status: 200, description: 'Webhooks configurés' })
  async configureWebhooks(@Body() body: { enable: boolean }) {
    return this.cjService.configureWebhooks(body.enable);
  }

  @Get('webhooks/logs')
  @ApiOperation({ summary: 'Obtenir les logs des webhooks' })
  @ApiResponse({ status: 200, description: 'Logs des webhooks' })
  async getWebhookLogs(@Query() query: any) {
    return this.cjService.getWebhookLogs(query);
  }

  // ===== STATISTIQUES =====

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques CJ Dropshipping' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getStats() {
    return this.cjService.getStats();
  }

  @Get('stats/products')
  @ApiOperation({ summary: 'Statistiques des produits' })
  @ApiResponse({ status: 200, description: 'Statistiques produits' })
  async getProductStats() {
    return this.cjService.getProductStats();
  }

  @Get('stats/orders')
  @ApiOperation({ summary: 'Statistiques des commandes' })
  @ApiResponse({ status: 200, description: 'Statistiques commandes' })
  async getOrderStats() {
    return this.cjService.getOrderStats();
  }

  @Get('stats/webhooks')
  @ApiOperation({ summary: 'Statistiques des webhooks' })
  @ApiResponse({ status: 200, description: 'Statistiques webhooks' })
  async getWebhookStats() {
    return this.cjService.getWebhookStats();
  }
}

