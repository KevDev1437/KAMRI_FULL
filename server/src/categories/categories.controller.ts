import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  @ApiResponse({ status: 200, description: 'Liste des catégories récupérée avec succès' })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return {
      data: categories,
      message: 'Catégories récupérées avec succès'
    };
  }

  @Get('unmapped-external')
  @ApiOperation({ summary: 'Récupérer les catégories externes non mappées' })
  @ApiResponse({ status: 200, description: 'Catégories externes non mappées récupérées avec succès' })
  async getUnmappedExternalCategories() {
    try {
      const categories = await this.categoriesService.getUnmappedExternalCategories();
      return {
        data: categories,
        message: 'Catégories externes non mappées récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories non mappées:', error);
      return {
        error: 'Erreur lors de la récupération des catégories non mappées',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Get('mappings/all')
  @ApiOperation({ summary: 'Récupérer tous les mappings de catégories' })
  @ApiResponse({ status: 200, description: 'Mappings récupérés avec succès' })
  async getCategoryMappings() {
    const mappings = await this.categoriesService.getCategoryMappings();
    return {
      data: mappings,
      message: 'Mappings récupérés avec succès'
    };
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Créer un nouveau mapping de catégorie' })
  @ApiResponse({ status: 201, description: 'Mapping créé avec succès' })
  async createCategoryMapping(@Body() data: {
    supplierId: string;
    externalCategory: string;
    internalCategory: string;
  }) {
    const mapping = await this.categoriesService.createCategoryMapping(data);
    return {
      data: mapping,
      message: 'Mapping créé avec succès'
    };
  }

  @Put('mappings/:id')
  @ApiOperation({ summary: 'Modifier un mapping de catégorie' })
  @ApiResponse({ status: 200, description: 'Mapping modifié avec succès' })
  async updateCategoryMapping(
    @Param('id') id: string,
    @Body() data: {
      internalCategory?: string;
      status?: string;
    }
  ) {
    const mapping = await this.categoriesService.updateCategoryMapping(id, data);
    return {
      data: mapping,
      message: 'Mapping modifié avec succès'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @ApiResponse({ status: 200, description: 'Catégorie récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      return {
        error: 'Catégorie non trouvée'
      };
    }
    return {
      data: category,
      message: 'Catégorie récupérée avec succès'
    };
  }
}
