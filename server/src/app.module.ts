import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressesModule } from './addresses/addresses.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { CJDropshippingModule } from './cj-dropshipping/cj-dropshipping.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UsersModule } from './users/users.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    PaymentsModule,
    SuppliersModule,
    SettingsModule,
    DashboardModule,
    AddressesModule,
    UserSettingsModule,
    UsersModule,
    CJDropshippingModule,
  ],
})
export class AppModule {}

