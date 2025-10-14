import { Controller, Get, Param } from '@nestjs/common';
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
