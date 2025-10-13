import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { PlatformService } from '../common/services/platform.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { WebAuthController } from './controllers/web-auth.controller';
import { WebCartController } from './controllers/web-cart.controller';
import { WebOrdersController } from './controllers/web-orders.controller';
import { WebProductsController } from './controllers/web-products.controller';

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
