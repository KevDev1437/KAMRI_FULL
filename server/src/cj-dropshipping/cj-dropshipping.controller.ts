import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CJDropshippingService } from './cj-dropshipping.service';

@ApiTags('cj-dropshipping')
@Controller('api/cj-dropshipping')
export class CJDropshippingController {
  constructor(private readonly cjDropshippingService: CJDropshippingService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get CJ Dropshipping categories' })
  @ApiResponse({ status: 200, description: 'CJ categories retrieved successfully' })
  getCJCategories() {
    return this.cjDropshippingService.getCJCategories();
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Search products in CJ Dropshipping catalog' })
  @ApiResponse({ status: 200, description: 'CJ products retrieved successfully' })
  searchCJProducts(@Query() searchParams: any) {
    return this.cjDropshippingService.searchCJProducts(searchParams);
  }

  @Get('products/:pid/details')
  @ApiOperation({ summary: 'Get detailed product info from CJ' })
  @ApiResponse({ status: 200, description: 'CJ product details retrieved successfully' })
  getCJProductDetails(@Param('pid') pid: string) {
    return this.cjDropshippingService.getCJProductDetails(pid);
  }

  @Post('products/import')
  @ApiOperation({ summary: 'Import a product from CJ to local database' })
  @ApiResponse({ status: 201, description: 'Product imported successfully' })
  importCJProduct(@Body() importData: any) {
    return this.cjDropshippingService.importCJProduct(importData);
  }

  @Get('products/:pid/stock')
  @ApiOperation({ summary: 'Get stock information for CJ product' })
  @ApiResponse({ status: 200, description: 'CJ product stock retrieved successfully' })
  getCJProductStock(@Param('pid') pid: string, @Query('countryCode') countryCode: string) {
    return this.cjDropshippingService.getCJProductStock(pid, countryCode);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get CJ Dropshipping configuration' })
  @ApiResponse({ status: 200, description: 'CJ configuration retrieved successfully' })
  getCJConfig() {
    return this.cjDropshippingService.getCJConfig();
  }

  @Post('config')
  @ApiOperation({ summary: 'Update CJ Dropshipping configuration' })
  @ApiResponse({ status: 200, description: 'CJ configuration updated successfully' })
  updateCJConfig(@Body() configData: any) {
    return this.cjDropshippingService.updateCJConfig(configData);
  }

  @Put('config')
  @ApiOperation({ summary: 'Update CJ Dropshipping configuration (PUT)' })
  @ApiResponse({ status: 200, description: 'CJ configuration updated successfully' })
  updateCJConfigPut(@Body() configData: any) {
    return this.cjDropshippingService.updateCJConfig(configData);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get CJ Dropshipping statistics' })
  @ApiResponse({ status: 200, description: 'CJ statistics retrieved successfully' })
  getCJStats() {
    return this.cjDropshippingService.getCJStats();
  }

  @Post('config/test')
  @ApiOperation({ summary: 'Test CJ Dropshipping connection' })
  @ApiResponse({ status: 200, description: 'CJ connection tested successfully' })
  testCJConnection() {
    return this.cjDropshippingService.testCJConnection();
  }
}