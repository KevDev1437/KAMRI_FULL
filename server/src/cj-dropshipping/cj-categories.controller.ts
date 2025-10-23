import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CJCategoriesService } from './cj-categories.service';

@ApiTags('CJ Dropshipping - Catégories')
@Controller('api/cj-dropshipping/categories')
export class CJCategoriesController {
  private readonly logger = new Logger(CJCategoriesController.name);

  constructor(private readonly cjCategoriesService: CJCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories CJ' })
  @ApiResponse({ status: 200, description: 'Catégories récupérées avec succès' })
  async getAllCategories() {
    this.logger.log('🏷️ Récupération des catégories CJ');
    return this.cjCategoriesService.getAllCategories();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Récupérer l\'arbre des catégories CJ' })
  @ApiResponse({ status: 200, description: 'Arbre des catégories récupéré avec succès' })
  async getCategoriesTree() {
    this.logger.log('🌳 Récupération de l\'arbre des catégories CJ');
    return this.cjCategoriesService.getCategoriesTree();
  }

  @Get('sync')
  @ApiOperation({ summary: 'Synchroniser les catégories CJ avec la base de données' })
  @ApiResponse({ status: 200, description: 'Catégories synchronisées avec succès' })
  async syncCategories() {
    this.logger.log('🔄 Synchronisation des catégories CJ');
    return this.cjCategoriesService.getAllCategories();
  }
}
