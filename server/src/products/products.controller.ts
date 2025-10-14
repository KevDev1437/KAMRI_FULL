import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all products for admin (including pending)' })
  @ApiResponse({ status: 200, description: 'All products retrieved successfully' })
  findAllForAdmin() {
    return this.productsService.findAllForAdmin();
  }

  @Get('admin/pending')
  @ApiOperation({ summary: 'Get pending products for validation' })
  @ApiResponse({ status: 200, description: 'Pending products retrieved successfully' })
  getPendingProducts() {
    return this.productsService.getPendingProducts();
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending product' })
  @ApiResponse({ status: 200, description: 'Product approved successfully' })
  approve(@Param('id') id: string) {
    return this.productsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending product' })
  @ApiResponse({ status: 200, description: 'Product rejected successfully' })
  reject(@Param('id') id: string) {
    return this.productsService.reject(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

