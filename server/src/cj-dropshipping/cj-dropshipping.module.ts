import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';
import { CJCountriesController } from './cj-countries.controller';
import { CJCountriesService } from './cj-countries.service';
import { CJDisputesController } from './cj-disputes.controller';
import { CJDisputesService } from './cj-disputes.service';
import { CJDropshippingController } from './cj-dropshipping.controller';
import { CJDropshippingService } from './cj-dropshipping.service';
import { CJLogisticsController } from './cj-logistics.controller';
import { CJLogisticsService } from './cj-logistics.service';
import { CJOrdersController } from './cj-orders.controller';
import { CJOrdersService } from './cj-orders.service';
import { CJSettingsController } from './cj-settings.controller';
import { CJSettingsService } from './cj-settings.service';
import { CJWebhookController } from './cj-webhook.controller';
import { CJWebhookService } from './cj-webhook.service';

@Module({
  imports: [ConfigModule],
  controllers: [CJDropshippingController, CJWebhookController, CJLogisticsController, CJCountriesController, CJSettingsController, CJOrdersController, CJDisputesController],
  providers: [CJDropshippingService, CJWebhookService, CJLogisticsService, CJCountriesService, CJSettingsService, CJOrdersService, CJDisputesService, CJAPIClient, PrismaService],
  exports: [CJDropshippingService, CJWebhookService, CJLogisticsService, CJCountriesService, CJSettingsService, CJOrdersService, CJDisputesService, CJAPIClient],
})
export class CJDropshippingModule {}

