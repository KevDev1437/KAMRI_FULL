import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { PlatformService } from '../common/services/platform.service';
import { OrdersModule } from '../orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { WebAuthController } from './controllers/web-auth.controller';
import { WebCartController } from './controllers/web-cart.controller';
import { WebCategoriesController } from './controllers/web-categories.controller';
import { WebOrdersController } from './controllers/web-orders.controller';
import { WebProductsController } from './controllers/web-products.controller';

@Module({
  imports: [AuthModule, ProductsModule, CartModule, OrdersModule, PrismaModule],
  controllers: [
    WebAuthController,
    WebProductsController,
    WebCartController,
    WebOrdersController,
    WebCategoriesController,
  ],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class WebModule {}
