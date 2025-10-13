import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // TODO: Créer ce guard
import { ProductsSyncService } from '../services/products-sync.service';

@ApiTags('Dashboard - Products Sync')
@Controller('api/dashboard/sync')
@UseGuards(JwtAuthGuard) // Protection admin
export class ProductsSyncController {
  constructor(private readonly productsSyncService: ProductsSyncService) {}

  @Post('supplier/:supplierId')
  @ApiOperation({ summary: 'Sync products from specific supplier' })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  async syncSupplierProducts(@Param('supplierId') supplierId: string) {
    return this.productsSyncService.syncProductsFromSupplier(supplierId);
  }

  @Post('all')
  @ApiOperation({ summary: 'Sync products from all active suppliers' })
  @ApiResponse({ status: 200, description: 'All syncs completed' })
  async syncAllSuppliers() {
    return this.productsSyncService.syncAllSuppliers();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get sync history' })
  @ApiResponse({ status: 200, description: 'Sync history' })
  async getSyncHistory(@Param('supplierId') supplierId?: string) {
    return this.productsSyncService.getSyncHistory(supplierId);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule automatic sync' })
  @ApiResponse({ status: 200, description: 'Auto sync scheduled' })
  async scheduleAutoSync() {
    return this.productsSyncService.scheduleAutoSync();
  }
}
