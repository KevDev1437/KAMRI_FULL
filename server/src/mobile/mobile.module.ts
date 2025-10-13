import { Module } from '@nestjs/common';
import { MobileAuthController } from './controllers/mobile-auth.controller';
import { MobileProductsController } from './controllers/mobile-products.controller';
import { MobileCartController } from './controllers/mobile-cart.controller';
import { MobileOrdersController } from './controllers/mobile-orders.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { PlatformService } from '../common/services/platform.service';

@Module({
  imports: [AuthModule, ProductsModule, CartModule, OrdersModule],
  controllers: [
    MobileAuthController,
    MobileProductsController,
    MobileCartController,
    MobileOrdersController,
  ],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class MobileModule {}
