import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // TODO: Créer ce guard
import { SuppliersService } from '../services/suppliers.service';

@ApiTags('Dashboard - Suppliers')
@Controller('api/dashboard/suppliers')
@UseGuards(JwtAuthGuard) // Protection admin
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of all suppliers' })
  async getAllSuppliers() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier details' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getSupplierById(@Param('id') id: string) {
    return this.suppliersService.getSupplierById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async createSupplier(@Body() supplierData: any) {
    return this.suppliersService.createSupplier(supplierData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  async updateSupplier(@Param('id') id: string, @Body() updateData: any) {
    return this.suppliersService.updateSupplier(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  async deleteSupplier(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(id);
  }

  @Post(':id/test-connection')
  @ApiOperation({ summary: 'Test supplier connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(@Param('id') id: string) {
    return this.suppliersService.testConnection(id);
  }
}
