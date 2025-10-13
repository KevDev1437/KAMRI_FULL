import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface Supplier {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  type: 'dropshipping' | 'wholesale' | 'marketplace';
  status: 'active' | 'inactive' | 'pending';
  productsCount: number;
  lastSync: Date;
  settings: {
    autoSync: boolean;
    syncInterval: number; // en minutes
    priceMarkup: number; // pourcentage
    stockThreshold: number;
  };
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async createSupplier(supplierData: Omit<Supplier, 'id' | 'productsCount' | 'lastSync'>) {
    return this.prisma.supplier.create({
      data: {
        name: supplierData.name,
        apiUrl: supplierData.apiUrl,
        apiKey: supplierData.apiKey,
        type: supplierData.type,
        status: supplierData.status,
        settings: JSON.stringify(supplierData.settings),
      },
    });
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      apiUrl: supplier.apiUrl,
      apiKey: supplier.apiKey,
      type: supplier.type as any,
      status: supplier.status as any,
      productsCount: supplier._count.products,
      lastSync: supplier.lastSync,
      settings: JSON.parse(supplier.settings),
    }));
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!supplier) return null;

    return {
      id: supplier.id,
      name: supplier.name,
      apiUrl: supplier.apiUrl,
      apiKey: supplier.apiKey,
      type: supplier.type as any,
      status: supplier.status as any,
      productsCount: supplier._count.products,
      lastSync: supplier.lastSync,
      settings: JSON.parse(supplier.settings),
    };
  }

  async updateSupplier(id: string, updateData: Partial<Supplier>) {
    return this.prisma.supplier.update({
      where: { id },
      data: {
        name: updateData.name,
        apiUrl: updateData.apiUrl,
        apiKey: updateData.apiKey,
        type: updateData.type,
        status: updateData.status,
        settings: updateData.settings ? JSON.stringify(updateData.settings) : undefined,
      },
    });
  }

  async deleteSupplier(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async testConnection(supplierId: string): Promise<{ success: boolean; message: string }> {
    const supplier = await this.getSupplierById(supplierId);
    if (!supplier) {
      return { success: false, message: 'Supplier not found' };
    }

    try {
      // TODO: Implémenter le test de connexion réel
      const response = await fetch(`${supplier.apiUrl}/test`, {
        headers: {
          'Authorization': `Bearer ${supplier.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful' };
      } else {
        return { success: false, message: 'Connection failed' };
      }
    } catch (error) {
      return { success: false, message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}
