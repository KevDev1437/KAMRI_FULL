import { Controller, Get, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { PlatformService } from '../../common/services/platform.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';

@ApiTags('Mobile Products')
@Controller('api/mobile/products')
@UseGuards(PlatformGuard)
@Platform('mobile')
export class MobileProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get products optimized for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 20 for mobile)' })
  @ApiQuery({ name: 'category', required: false, description: 'Product category' })
  async getProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit))); // Max 20 pour mobile
    
    // TODO: Remplacer par des données réelles
    const products = await this.productsService.findAll({
      page: pageNum,
      limit: limitNum,
      category,
    });

    // Optimisations spécifiques mobile
    const optimizedProducts = this.platformService.optimizeForMobile(products);

    return this.platformService.createMobileResponse(optimizedProducts, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length,
      },
      cache: { ttl: 300, key: `mobile_products_${category || 'all'}_${pageNum}` }
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getFeaturedProducts(@Headers('user-agent') userAgent: string) {
    // TODO: Remplacer par des données réelles
    const featuredProducts = await this.productsService.findFeatured();

    return this.platformService.createMobileResponse(featuredProducts, {
      cache: { ttl: 600, key: 'mobile_featured_products' }
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products optimized for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Headers('user-agent') userAgent: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    
    // TODO: Remplacer par une recherche réelle
    const searchResults = await this.productsService.search(query, {
      page: pageNum,
      limit: 15, // Limite réduite pour mobile
    });

    return this.platformService.createMobileResponse(searchResults, {
      pagination: {
        page: pageNum,
        limit: 15,
        total: searchResults.length,
      },
      cache: { ttl: 300, key: `mobile_search_${query}_${pageNum}` }
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getCategories(@Headers('user-agent') userAgent: string) {
    // TODO: Remplacer par des données réelles
    const categories = await this.productsService.getCategories();

    return this.platformService.createMobileResponse(categories, {
      cache: { ttl: 1800, key: 'mobile_categories' }
    });
  }
}
