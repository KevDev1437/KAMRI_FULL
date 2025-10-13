import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupplierFactoryService } from '../services/supplier-factory.service';

@ApiTags('Generic Supplier')
@Controller('api/suppliers')
export class GenericSupplierController {
  constructor(private readonly supplierFactory: SupplierFactoryService) {}

  @Get(':supplierName/products')
  @ApiOperation({ summary: 'Récupérer les produits d\'un fournisseur' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de produits à récupérer' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre de produits à ignorer' })
  @ApiQuery({ name: 'category', required: false, description: 'Catégorie de produits' })
  @ApiResponse({ status: 200, description: 'Liste des produits récupérée avec succès' })
  async getProducts(
    @Param('supplierName') supplierName: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('category') category?: string
  ) {
    const options = { limit, skip, category };
    return this.supplierFactory.getProducts(supplierName, options);
  }

  @Get(':supplierName/products/:productId')
  @ApiOperation({ summary: 'Récupérer un produit spécifique' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit récupéré avec succès' })
  async getProduct(
    @Param('supplierName') supplierName: string,
    @Param('productId') productId: string
  ) {
    // Utiliser le service générique pour récupérer un produit spécifique
    const { genericSupplierService } = this.supplierFactory as any;
    return genericSupplierService.getProduct(supplierName, productId);
  }

  @Get(':supplierName/users')
  @ApiOperation({ summary: 'Récupérer les utilisateurs d\'un fournisseur' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'utilisateurs à récupérer' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre d\'utilisateurs à ignorer' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  async getUsers(
    @Param('supplierName') supplierName: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number
  ) {
    const options = { limit, skip };
    return this.supplierFactory.getUsers(supplierName, options);
  }

  @Get(':supplierName/categories')
  @ApiOperation({ summary: 'Récupérer les catégories d\'un fournisseur' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiResponse({ status: 200, description: 'Liste des catégories récupérée avec succès' })
  async getCategories(@Param('supplierName') supplierName: string) {
    return this.supplierFactory.getCategories(supplierName);
  }

  @Get(':supplierName/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un fournisseur' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  async getStats(@Param('supplierName') supplierName: string) {
    return this.supplierFactory.getStats(supplierName);
  }

  @Post(':supplierName/test-connection')
  @ApiOperation({ summary: 'Tester la connexion à un fournisseur' })
  @ApiParam({ name: 'supplierName', description: 'Nom du fournisseur' })
  @ApiResponse({ status: 200, description: 'Test de connexion effectué' })
  async testConnection(@Param('supplierName') supplierName: string) {
    return this.supplierFactory.testConnection(supplierName);
  }
}
