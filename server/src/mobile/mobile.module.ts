import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { PlatformService } from '../common/services/platform.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { MobileAuthController } from './controllers/mobile-auth.controller';
import { MobileCartController } from './controllers/mobile-cart.controller';
import { MobileOrdersController } from './controllers/mobile-orders.controller';
import { MobileProductsController } from './controllers/mobile-products.controller';

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
