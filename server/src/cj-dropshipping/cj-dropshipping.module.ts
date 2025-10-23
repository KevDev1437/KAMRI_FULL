import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CJDropshippingController } from './cj-dropshipping.controller';
import { CJDropshippingService } from './cj-dropshipping.service';

@Module({
  imports: [PrismaModule],
  controllers: [CJDropshippingController],
  providers: [CJDropshippingService],
  exports: [CJDropshippingService],
})
export class CJDropshippingModule {}