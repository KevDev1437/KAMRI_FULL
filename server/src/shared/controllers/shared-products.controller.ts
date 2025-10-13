import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { PlatformService } from '../../common/services/platform.service';

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
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '30',
    @Query('category') category?: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    
    // Détection automatique de la plateforme
    const platform = this.platformService.detectPlatform(userAgent);
    
    // TODO: Remplacer par des données réelles
    const products = await this.productsService.findAll({
      page: pageNum,
      limit: limitNum,
      category,
    });

    // Optimisation selon la plateforme
    const optimizedProducts = platform === 'mobile' 
      ? this.platformService.optimizeForMobile(products)
      : this.platformService.optimizeForWeb(products);

    return this.platformService.createSharedResponse(optimizedProducts, platform);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories (shared endpoint)' })
  async getCategories(@Headers('user-agent') userAgent: string) {
    const platform = this.platformService.detectPlatform(userAgent);
    
    // TODO: Remplacer par des données réelles
    const categories = await this.productsService.getCategories();

    return this.platformService.createSharedResponse(categories, platform);
  }
}
