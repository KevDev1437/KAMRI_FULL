import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      include: {
        products: true,
        categoryMappings: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        categoryMappings: true,
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async testConnection(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new Error('Fournisseur non trouvé');
    }

    // Simulation du test de connexion
    const isConnected = Math.random() > 0.3; // 70% de chance de succès

    if (isConnected) {
      await this.prisma.supplier.update({
        where: { id },
        data: {
          status: 'connected',
          lastSync: new Date(),
        },
      });
      return { success: true, message: 'Connexion réussie' };
    } else {
      await this.prisma.supplier.update({
        where: { id },
        data: { status: 'disconnected' },
      });
      return { success: false, message: 'Échec de la connexion' };
    }
  }

  async getStats() {
    const total = await this.prisma.supplier.count();
    const connected = await this.prisma.supplier.count({
      where: { status: 'connected' },
    });
    const products = await this.prisma.product.count({
      where: { supplierId: { not: null } },
    });

    return {
      total,
      connected,
      disconnected: total - connected,
      products,
    };
  }
}
