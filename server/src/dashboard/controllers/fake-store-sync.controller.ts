import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FakeStoreApiService } from '../services/fake-store-api.service';
import { FakeStoreSyncService } from '../services/fake-store-sync.service';

@ApiTags('Dashboard - Fake Store Sync')
@Controller('api/dashboard/fake-store')
// @UseGuards(JwtAuthGuard) // Temporairement désactivé pour les tests
export class FakeStoreSyncController {
  constructor(
    private readonly fakeStoreApi: FakeStoreApiService,
    private readonly fakeStoreSync: FakeStoreSyncService,
  ) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test connection to Fake Store API' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    return this.fakeStoreApi.testConnection();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products from Fake Store API' })
  @ApiResponse({ status: 200, description: 'List of products from Fake Store API' })
  async getProducts() {
    return this.fakeStoreApi.getAllProducts();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get specific product from Fake Store API' })
  @ApiResponse({ status: 200, description: 'Product details from Fake Store API' })
  async getProduct(@Param('id') id: string) {
    return this.fakeStoreApi.getProductById(parseInt(id));
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories from Fake Store API' })
  @ApiResponse({ status: 200, description: 'List of categories from Fake Store API' })
  async getCategories() {
    return this.fakeStoreApi.getCategories();
  }

  @Post('sync/all')
  @ApiOperation({ summary: 'Sync all products from Fake Store API to database' })
  @ApiResponse({ status: 200, description: 'Sync result' })
  async syncAllProducts() {
    return this.fakeStoreSync.syncAllProducts();
  }

  @Post('sync/product/:id')
  @ApiOperation({ summary: 'Sync specific product from Fake Store API' })
  @ApiResponse({ status: 200, description: 'Sync result for specific product' })
  async syncProduct(@Param('id') id: string) {
    return this.fakeStoreSync.syncProductById(parseInt(id));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get sync statistics' })
  @ApiResponse({ status: 200, description: 'Sync statistics' })
  async getSyncStats() {
    return this.fakeStoreSync.getSyncStats();
  }
}
