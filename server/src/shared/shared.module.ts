import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlatformService } from '../common/services/platform.service';
import { ProductsModule } from '../products/products.module';
import { SharedAuthController } from './controllers/shared-auth.controller';
import { SharedProductsController } from './controllers/shared-products.controller';

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
