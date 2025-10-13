import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';
import { ProductsService } from '../../products/products.service';

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
    @Headers('user-agent') userAgent: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit))); // Max 20 pour mobile
    
    const products = await this.productsService.search('', {
      page: pageNum,
      limit: limitNum,
    });

    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(products, 'mobile', { 
      limit: limitNum, 
      offset: (pageNum - 1) * limitNum 
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getFeaturedProducts(@Headers('user-agent') userAgent: string) {
    const featuredProducts = await this.productsService.findFeatured();
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(featuredProducts, 'mobile');
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products optimized for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  async searchProducts(
    @Headers('user-agent') userAgent: string,
    @Query('q') query: string,
    @Query('page') page: string = '1',
  ) {
    const pageNum = Math.max(1, parseInt(page));
    
    const searchResults = await this.productsService.search(query, {
      page: pageNum,
      limit: 15, // Limite réduite pour mobile
    });

    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(searchResults, 'mobile', {
      limit: 15,
      offset: (pageNum - 1) * 15
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories for mobile' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async getCategories(@Headers('user-agent') userAgent: string) {
    const categories = await this.productsService.getCategories();
    const platform = this.platformService.detectPlatform(userAgent || '');
    return this.platformService.optimizeResponse(categories, 'mobile');
  }
}
