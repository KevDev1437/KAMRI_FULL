import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // TODO: Créer ce guard

@ApiTags('Dashboard - Analytics')
@Controller('api/dashboard/analytics')
@UseGuards(JwtAuthGuard) // Protection admin
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('sync')
  @ApiOperation({ summary: 'Get sync analytics' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Sync analytics' })
  async getSyncAnalytics(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.analyticsService.getSyncAnalytics(daysNumber);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get supplier performance analytics' })
  @ApiResponse({ status: 200, description: 'Supplier performance data' })
  async getSupplierPerformance(@Param('supplierId') supplierId: string) {
    return this.analyticsService.getSupplierPerformance(supplierId);
  }
}
