import { Controller, Get, Headers, Param, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';
import { ProductsService } from '../../products/products.service';

@ApiTags('Web Products')
@Controller('api/web/products')
@UseGuards(PlatformGuard)
@Platform('web')
export class WebProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get products optimized for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100 for web)' })
  @ApiQuery({ name: 'category', required: false, description: 'Product category' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'filters', required: false, description: 'JSON filters' })
  async getProducts(
    @Headers('user-agent') userAgent: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('filters') filters?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 pour web
    
    // Récupérer tous les produits avec pagination
    let products;
    if (category) {
      // Filtrer par catégorie si spécifiée
      products = await this.productsService.findByCategoryName(category);
    } else {
      products = await this.productsService.findAll();
    }

    const platform = this.platformService.detectPlatform(userAgent || '');
    
    // Appliquer la pagination manuellement si nécessaire
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedProducts,
      total: products.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(products.length / limitNum)
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getFeaturedProducts(@Headers('user-agent') userAgent: string) {
    const featuredProducts = await this.productsService.findFeatured();
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(featuredProducts, 'web');
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products optimized for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'filters', required: false, description: 'JSON filters' })
  async searchProducts(
    @Headers('user-agent') userAgent: string,
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('sort') sort?: string,
    @Query('filters') filters?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    
    // TODO: Remplacer par une recherche réelle
    const searchResults = await this.productsService.search(query, {
      page: pageNum,
      limit: 30, // Limite plus élevée pour web
      sort,
      filters: filters ? JSON.parse(filters) : undefined,
    });

    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(searchResults, 'web', {
      limit: 30,
      offset: (pageNum - 1) * 30
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getCategories(@Headers('user-agent') userAgent: string) {
    const categories = await this.productsService.getCategories();
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(categories, 'web');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async getProductById(
    @Headers('user-agent') userAgent: string,
    @Param('id') id: string,
  ) {
    const product = await this.productsService.findById(id);
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(product, 'web');
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get product analytics for web dashboard' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getAnalytics(@Headers('user-agent') userAgent: string) {
    const analytics = await this.productsService.getAnalytics();
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse([analytics], 'web');
  }
}
