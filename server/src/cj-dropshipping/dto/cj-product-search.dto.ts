import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CJProductSearchDto {
  @ApiProperty({ 
    description: 'Numéro de page', 
    example: 1,
    minimum: 1,
    required: false 
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageNum?: number;

  @ApiProperty({ 
    description: 'Taille de page (max 200)', 
    example: 20,
    minimum: 1,
    maximum: 200,
    required: false 
  })
  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ 
    description: 'ID de catégorie', 
    required: false 
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ 
    description: 'Product ID', 
    required: false 
  })
  @IsString()
  @IsOptional()
  pid?: string;

  @ApiProperty({ 
    description: 'Product SKU', 
    required: false 
  })
  @IsString()
  @IsOptional()
  productSku?: string;

  @ApiProperty({ 
    description: 'Nom du produit (chinois)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    description: 'Nom du produit (anglais)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  productNameEn?: string;

  @ApiProperty({ 
    description: 'Type de produit', 
    enum: ['ORDINARY_PRODUCT', 'SERVICE_PRODUCT', 'PACKAGING_PRODUCT', 'SUPPLIER_PRODUCT', 'SUPPLIER_SHIPPED_PRODUCT'],
    required: false 
  })
  @IsString()
  @IsOptional()
  productType?: string;

  @ApiProperty({ 
    description: 'Code pays (ex: CN, US)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ 
    description: 'Délai de livraison en heures', 
    enum: ['24', '48', '72'],
    required: false 
  })
  @IsString()
  @IsOptional()
  deliveryTime?: string;

  @ApiProperty({ 
    description: 'Type d\'inventaire vérifié (1=Vérifié, 2=Non vérifié)', 
    enum: [1, 2],
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  verifiedWarehouse?: number;

  @ApiProperty({ 
    description: 'Stock minimum', 
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  startInventory?: number;

  @ApiProperty({ 
    description: 'Stock maximum', 
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  endInventory?: number;

  @ApiProperty({ 
    description: 'Date de création (début) - format: yyyy-MM-dd hh:mm:ss', 
    required: false 
  })
  @IsString()
  @IsOptional()
  createTimeFrom?: string;

  @ApiProperty({ 
    description: 'Date de création (fin) - format: yyyy-MM-dd hh:mm:ss', 
    required: false 
  })
  @IsString()
  @IsOptional()
  createTimeTo?: string;

  @ApiProperty({ 
    description: 'ID de marque', 
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  brandOpenId?: number;

  @ApiProperty({ 
    description: 'Prix minimum', 
    example: 1.0,
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ 
    description: 'Prix maximum', 
    example: 100.0,
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ 
    description: 'Type de recherche (0=Tous, 2=Tendances, 21=Plus de tendances)', 
    enum: [0, 2, 21],
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  searchType?: number;

  @ApiProperty({ 
    description: 'Nombre minimum de listes', 
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minListedNum?: number;

  @ApiProperty({ 
    description: 'Nombre maximum de listes', 
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxListedNum?: number;

  @ApiProperty({ 
    description: 'Type de tri (desc/asc)', 
    enum: ['desc', 'asc'],
    required: false 
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({ 
    description: 'Champ de tri (createAt/listedNum)', 
    enum: ['createAt', 'listedNum'],
    required: false 
  })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiProperty({ 
    description: 'Support pickup (1=supporté, 0=non supporté)', 
    enum: [0, 1],
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  isSelfPickup?: number;

  @ApiProperty({ 
    description: 'ID du fournisseur', 
    required: false 
  })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ 
    description: 'Livraison gratuite (0=non, 1=oui)', 
    enum: [0, 1],
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  isFreeShipping?: number;

  @ApiProperty({ 
    description: 'Version de personnalisation (1-5)', 
    enum: [1, 2, 3, 4, 5],
    required: false 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  customizationVersion?: number;

  // Pour compatibilité avec l'ancien code
  @ApiProperty({ 
    description: 'Mot-clé de recherche (legacy)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ 
    description: 'Critère de tri (legacy)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  sortBy?: string;
}

export class CJProductImportDto {
  @ApiProperty({ description: 'ID du produit CJ à importer' })
  @IsString()
  pid: string;

  @ApiProperty({ description: 'ID de la catégorie KAMRI', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Marge à ajouter (en pourcentage)', required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  margin?: number;
}

