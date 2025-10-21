import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export enum WebhookType {
  PRODUCT = 'PRODUCT',
  STOCK = 'STOCK',
  ORDER = 'ORDER',
  LOGISTICS = 'LOGISTICS',
}

export class CJWebhookDto {
  @ApiProperty({ description: 'Type de webhook', example: 'PRODUCT' })
  @IsEnum(WebhookType)
  type: string; // Garder string ici, on cast ensuite

  @ApiProperty({ description: 'ID du message' })
  @IsString()
  messageId: string;

  @ApiProperty({ description: 'Données du webhook' })
  @IsObject()
  params: any;

  @ApiProperty({ description: 'Timestamp', required: false })
  @IsString()
  @IsOptional()
  timestamp?: string;
}

export class CJWebhookConfigDto {
  @ApiProperty({ description: 'URL du webhook' })
  @IsString()
  webhookUrl: string;

  @ApiProperty({ 
    description: 'Types d\'événements à écouter',
    example: ['PRODUCT', 'STOCK', 'ORDER', 'LOGISTICS']
  })
  @IsString()
  events: string[];
}

export class CJWebhookLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  messageId: string;

  @ApiProperty()
  payload: any;

  @ApiProperty()
  processed: boolean;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  createdAt: Date;
}

