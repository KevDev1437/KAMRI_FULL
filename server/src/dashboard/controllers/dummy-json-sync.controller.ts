import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DummyJsonSyncService } from '../services/dummy-json-sync.service';

@ApiTags('DummyJSON Sync')
@Controller('api/dummy-json')
export class DummyJsonSyncController {
  constructor(private readonly dummyJsonSyncService: DummyJsonSyncService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Synchroniser tous les produits DummyJSON' })
  @ApiResponse({ status: 200, description: 'Synchronisation réussie' })
  async syncAllProducts() {
    return this.dummyJsonSyncService.syncAllProducts();
  }

  @Post('categorize')
  @ApiOperation({ summary: 'Catégoriser les produits DummyJSON existants' })
  @ApiResponse({ status: 200, description: 'Catégorisation réussie' })
  async categorizeProducts() {
    return this.dummyJsonSyncService.categorizeDummyJsonProducts();
  }

  @Post('sync-and-categorize')
  @ApiOperation({ summary: 'Synchroniser et catégoriser en une seule opération' })
  @ApiResponse({ status: 200, description: 'Synchronisation et catégorisation réussies' })
  async syncAndCategorize() {
    return this.dummyJsonSyncService.syncAndCategorize();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des produits DummyJSON' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getStats() {
    // Cette méthode sera implémentée si nécessaire
    return { message: 'Statistiques DummyJSON - à implémenter' };
  }
}
