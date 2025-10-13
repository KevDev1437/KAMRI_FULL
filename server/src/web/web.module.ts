import { Module } from '@nestjs/common';
import { WebAuthController } from './controllers/web-auth.controller';
import { WebProductsController } from './controllers/web-products.controller';
import { WebCartController } from './controllers/web-cart.controller';
import { WebOrdersController } from './controllers/web-orders.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { PlatformService } from '../common/services/platform.service';

@Module({
  imports: [AuthModule, ProductsModule, CartModule, OrdersModule],
  controllers: [
    WebAuthController,
    WebProductsController,
    WebCartController,
    WebOrdersController,
  ],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class WebModule {}
