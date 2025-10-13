import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { ProductsSyncController } from './controllers/products-sync.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { DashboardService } from './services/dashboard.service';
import { SuppliersService } from './services/suppliers.service';
import { ProductsSyncService } from './services/products-sync.service';
import { AnalyticsService } from './services/analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    DashboardController,
    SuppliersController,
    ProductsSyncController,
    AnalyticsController,
  ],
  providers: [
    DashboardService,
    SuppliersService,
    ProductsSyncService,
    AnalyticsService,
  ],
  exports: [
    DashboardService,
    SuppliersService,
    ProductsSyncService,
    AnalyticsService,
  ],
})
export class DashboardModule {}
