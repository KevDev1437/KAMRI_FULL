import { Controller, Get, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { PlatformService } from '../../common/services/platform.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';

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
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 50 for web)' })
  @ApiQuery({ name: 'category', required: false, description: 'Product category' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'filters', required: false, description: 'JSON filters' })
  async getProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('filters') filters?: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 pour web
    
    // TODO: Remplacer par des données réelles
    const products = await this.productsService.findAll({
      page: pageNum,
      limit: limitNum,
      category,
      sort,
      filters: filters ? JSON.parse(filters) : undefined,
    });

    // Optimisations spécifiques web
    const optimizedProducts = this.platformService.optimizeForWeb(products);

    return this.platformService.createWebResponse(optimizedProducts, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
      },
      cache: { ttl: 600, key: `web_products_${category || 'all'}_${pageNum}_${sort || 'default'}` }
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getFeaturedProducts(@Headers('user-agent') userAgent: string) {
    // TODO: Remplacer par des données réelles
    const featuredProducts = await this.productsService.findFeatured();

    return this.platformService.createWebResponse(featuredProducts, {
      cache: { ttl: 1200, key: 'web_featured_products' }
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products optimized for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'filters', required: false, description: 'JSON filters' })
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('sort') sort?: string,
    @Query('filters') filters?: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    
    // TODO: Remplacer par une recherche réelle
    const searchResults = await this.productsService.search(query, {
      page: pageNum,
      limit: 30, // Limite plus élevée pour web
      sort,
      filters: filters ? JSON.parse(filters) : undefined,
    });

    return this.platformService.createWebResponse(searchResults, {
      pagination: {
        page: pageNum,
        limit: 30,
        total: searchResults.length,
      },
      cache: { ttl: 600, key: `web_search_${query}_${pageNum}_${sort || 'default'}` }
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories for web' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getCategories(@Headers('user-agent') userAgent: string) {
    // TODO: Remplacer par des données réelles
    const categories = await this.productsService.getCategories();

    return this.platformService.createWebResponse(categories, {
      cache: { ttl: 3600, key: 'web_categories' }
    });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get product analytics for web dashboard' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getAnalytics(@Headers('user-agent') userAgent: string) {
    // TODO: Remplacer par des données réelles
    const analytics = await this.productsService.getAnalytics();

    return this.platformService.createWebResponse(analytics, {
      cache: { ttl: 1800, key: 'web_product_analytics' }
    });
  }
}
