import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import { CJConfigService } from './cj-config.service';
import { CJFavoriteService } from './cj-favorite.service';
import { CJMainService } from './cj-main.service';
import { CJOrderService } from './cj-order.service';
import { CJProductService } from './cj-product.service';
import { CJWebhookService } from './cj-webhook.service';

@Module({
  providers: [
    PrismaService,
    CJAPIClient,
    CJConfigService,
    CJProductService,
    CJFavoriteService,
    CJOrderService,
    CJWebhookService,
    CJMainService,
  ],
  exports: [
    CJConfigService,
    CJProductService,
    CJFavoriteService,
    CJOrderService,
    CJWebhookService,
    CJMainService,
  ],
})
export class CJServicesModule {}

