import { Module } from '@nestjs/common';
import { SharedProductsController } from './controllers/shared-products.controller';
import { SharedAuthController } from './controllers/shared-auth.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { PlatformService } from '../common/services/platform.service';

@Module({
  imports: [ProductsModule, AuthModule],
  controllers: [
    SharedProductsController,
    SharedAuthController,
  ],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class SharedModule {}
