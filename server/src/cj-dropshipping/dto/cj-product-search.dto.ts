import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CJProductSearchDto {
  @ApiProperty({ 
    description: 'Mot-clé de recherche', 
    example: 'phone case',
    required: false 
  })
  @IsString()
  @IsOptional()
  keyword?: string;

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
    description: 'Taille de page', 
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false 
  })
  @IsNumber()
  @Min(1)
  @Max(100)
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
    description: 'Prix minimum', 
    example: 10.00,
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
    example: 100.00,
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ 
    description: 'Code pays pour le stock', 
    example: 'US',
    required: false 
  })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ 
    description: 'Critère de tri', 
    example: 'relevance',
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

