import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsController } from './controllers/analytics.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { FakeStoreSyncController } from './controllers/fake-store-sync.controller';
import { ProductsSyncController } from './controllers/products-sync.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { AnalyticsService } from './services/analytics.service';
import { DashboardService } from './services/dashboard.service';
import { FakeStoreApiService } from './services/fake-store-api.service';
import { FakeStoreSyncService } from './services/fake-store-sync.service';
import { MockSuppliersService } from './services/mock-suppliers.service';
import { ProductsSyncService } from './services/products-sync.service';
import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    DashboardController,
    SuppliersController,
    ProductsSyncController,
    AnalyticsController,
    FakeStoreSyncController,
  ],
  providers: [
    DashboardService,
    SuppliersService,
    ProductsSyncService,
    AnalyticsService,
    MockSuppliersService,
    FakeStoreApiService,
    FakeStoreSyncService,
  ],
  exports: [
    DashboardService,
    SuppliersService,
    ProductsSyncService,
    AnalyticsService,
    FakeStoreApiService,
    FakeStoreSyncService,
  ],
})
export class DashboardModule {}
