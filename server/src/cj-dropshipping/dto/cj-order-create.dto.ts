import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CJOrderProductDto {
  @ApiProperty({ description: 'ID de la variante CJ' })
  @IsString()
  vid: string;

  @ApiProperty({ description: 'Quantité', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CJOrderCreateDto {
  @ApiProperty({ description: 'Numéro de commande unique' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ description: 'Code pays de livraison', example: 'US' })
  @IsString()
  shippingCountryCode: string;

  @ApiProperty({ description: 'Pays de livraison', example: 'United States' })
  @IsString()
  shippingCountry: string;

  @ApiProperty({ description: 'Province/État de livraison', required: false })
  @IsString()
  @IsOptional()
  shippingProvince?: string;

  @ApiProperty({ description: 'Ville de livraison' })
  @IsString()
  shippingCity: string;

  @ApiProperty({ description: 'Adresse de livraison' })
  @IsString()
  shippingAddress: string;

  @ApiProperty({ description: 'Nom du client' })
  @IsString()
  shippingCustomerName: string;

  @ApiProperty({ description: 'Téléphone du client' })
  @IsString()
  shippingPhone: string;

  @ApiProperty({ description: 'Nom de la méthode de livraison' })
  @IsString()
  logisticName: string;

  @ApiProperty({ description: 'Code pays d\'expédition', example: 'CN', required: false })
  @IsString()
  @IsOptional()
  fromCountryCode?: string;

  @ApiProperty({ description: 'Plateforme', example: 'kamri', required: false })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({ 
    description: 'Produits de la commande',
    type: [CJOrderProductDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CJOrderProductDto)
  products: CJOrderProductDto[];
}

export class CJOrderStatusDto {
  @ApiProperty({ description: 'ID de la commande CJ' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Statut de la commande' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Numéro de suivi', required: false })
  @IsString()
  @IsOptional()
  trackNumber?: string;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: string;
}

