import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsController } from './controllers/analytics.controller';
import { AuthTestController } from './controllers/auth-test.controller';
import { CategoriesController } from './controllers/categories.controller';
import { CategoryManagementController } from './controllers/category-management.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { DummyJsonSyncController } from './controllers/dummy-json-sync.controller';
import { FakeStoreSyncController } from './controllers/fake-store-sync.controller';
import { FakeStoreUsersController } from './controllers/fake-store-users.controller';
import { GenericSupplierController } from './controllers/generic-supplier.controller';
import { ProductCategorizationController } from './controllers/product-categorization.controller';
import { ProductStatsController } from './controllers/product-stats.controller';
import { ProductsSyncController } from './controllers/products-sync.controller';
import { SimpleUsersController } from './controllers/simple-users.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { TestUsersController } from './controllers/test-users.controller';
import { UnificationController } from './controllers/unification.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { AnalyticsService } from './services/analytics.service';
import { CategoriesInitService } from './services/categories-init.service';
import { CategoryManagementService } from './services/category-management.service';
import { DashboardService } from './services/dashboard.service';
import { DummyJsonSyncService } from './services/dummy-json-sync.service';
import { FakeStoreApiService } from './services/fake-store-api.service';
import { FakeStoreSyncService } from './services/fake-store-sync.service';
import { FakeStoreUsersSyncService } from './services/fake-store-users-sync.service';
import { FakeStoreUsersService } from './services/fake-store-users.service';
import { GenericSupplierService } from './services/generic-supplier.service';
import { MockSuppliersService } from './services/mock-suppliers.service';
import { ProductCategorizationService } from './services/product-categorization.service';
import { ProductsSyncService } from './services/products-sync.service';
import { SupplierFactoryService } from './services/supplier-factory.service';
import { SuppliersService } from './services/suppliers.service';
import { UnificationService } from './services/unification.service';

@Module({
  imports: [PrismaModule, HttpModule],
      controllers: [
        DashboardController,
        SuppliersController,
        ProductsSyncController,
        AnalyticsController,
        CategoryManagementController,
        DummyJsonSyncController,
        FakeStoreSyncController,
        FakeStoreUsersController,
        GenericSupplierController,
        TestUsersController,
        SimpleUsersController,
        AuthTestController,
        UserProfileController,
        ProductCategorizationController,
        ProductStatsController,
        UnificationController,
        CategoriesController,
      ],
      providers: [
        DashboardService,
        SuppliersService,
        ProductsSyncService,
        AnalyticsService,
        CategoryManagementService,
        DummyJsonSyncService,
        MockSuppliersService,
        FakeStoreApiService,
        FakeStoreSyncService,
        FakeStoreUsersService,
        FakeStoreUsersSyncService,
        GenericSupplierService,
        SupplierFactoryService,
        ProductCategorizationService,
        CategoriesInitService,
        UnificationService,
      ],
      exports: [
        DashboardService,
        SuppliersService,
        ProductsSyncService,
        AnalyticsService,
        CategoryManagementService,
        DummyJsonSyncService,
        FakeStoreApiService,
        FakeStoreSyncService,
        FakeStoreUsersService,
        FakeStoreUsersSyncService,
        GenericSupplierService,
        SupplierFactoryService,
      ],
})
export class DashboardModule {}
