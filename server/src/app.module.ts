import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MobileModule } from './mobile/mobile.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SharedModule } from './shared/shared.module';
import { WebModule } from './web/web.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    MobileModule,
    WebModule,
    SharedModule,
    DashboardModule,
  ],
})
export class AppModule {}

