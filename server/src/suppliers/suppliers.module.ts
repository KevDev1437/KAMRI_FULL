import { Module } from '@nestjs/common';
import { CJDropshippingModule } from '../cj-dropshipping/cj-dropshipping.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
  imports: [PrismaModule, CJDropshippingModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
