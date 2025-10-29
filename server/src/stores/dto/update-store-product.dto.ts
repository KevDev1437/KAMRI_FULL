import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class UpdateStoreProductDto {
  @ApiProperty({ description: 'Nom du produit', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Description du produit', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Prix du produit', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'Prix original du produit', required: false })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({ description: 'Image principale du produit', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Catégorie du produit', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Statut du produit (available, selected, imported)', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Marquer comme favori', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({ description: 'SKU du produit', required: false })
  @IsOptional()
  @IsString()
  productSku?: string;

  @ApiProperty({ description: 'Poids du produit', required: false })
  @IsOptional()
  @IsString()
  productWeight?: string;

  @ApiProperty({ description: 'Poids d\'emballage', required: false })
  @IsOptional()
  @IsString()
  packingWeight?: string;

  @ApiProperty({ description: 'Type de produit', required: false })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiProperty({ description: 'Unité du produit', required: false })
  @IsOptional()
  @IsString()
  productUnit?: string;

  @ApiProperty({ description: 'Clé produit (EN)', required: false })
  @IsOptional()
  @IsString()
  productKeyEn?: string;

  @ApiProperty({ description: 'Nom du matériau (EN)', required: false })
  @IsOptional()
  @IsString()
  materialNameEn?: string;

  @ApiProperty({ description: 'Nom de l\'emballage (EN)', required: false })
  @IsOptional()
  @IsString()
  packingNameEn?: string;

  @ApiProperty({ description: 'Prix de vente suggéré', required: false })
  @IsOptional()
  @IsString()
  suggestSellPrice?: string;

  @ApiProperty({ description: 'Nombre listé', required: false })
  @IsOptional()
  @IsNumber()
  listedNum?: number;

  @ApiProperty({ description: 'Nom du fournisseur', required: false })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ description: 'Dimensions du produit', required: false })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({ description: 'Marque du produit', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Tags du produit (JSON)', required: false })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ description: 'Variantes du produit (JSON)', required: false })
  @IsOptional()
  @IsString()
  variants?: string;

  @ApiProperty({ description: 'Avis du produit (JSON)', required: false })
  @IsOptional()
  @IsString()
  reviews?: string;
}