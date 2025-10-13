import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlatformService } from '../../common/services/platform.service';
import { ProductsService } from '../../products/products.service';

@ApiTags('Shared Products')
@Controller('api/shared/products')
export class SharedProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get products (shared endpoint)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, description: 'Product category' })
  async getProducts(
    @Headers('user-agent') userAgent: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '30',
    @Query('category') category?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    
    const platform = this.platformService.detectPlatform(userAgent || '');
    
    const products = await this.productsService.search('', {
      page: pageNum,
      limit: limitNum,
    });

    return this.platformService.optimizeResponse(products, platform, {
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories (shared endpoint)' })
  async getCategories(@Headers('user-agent') userAgent: string) {
    const platform = this.platformService.detectPlatform(userAgent || '');
    const categories = await this.productsService.getCategories();
    return this.platformService.optimizeResponse(categories, platform);
  }
}
