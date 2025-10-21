import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';
import { CJDropshippingController } from './cj-dropshipping.controller';
import { CJDropshippingService } from './cj-dropshipping.service';

@Module({
  imports: [ConfigModule],
  controllers: [CJDropshippingController],
  providers: [CJDropshippingService, CJAPIClient, PrismaService],
  exports: [CJDropshippingService, CJAPIClient],
})
export class CJDropshippingModule {}

