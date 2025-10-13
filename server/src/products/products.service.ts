import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
        images: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        images: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { status: 'active' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: true,
        supplier: true,
      },
    });
  }

  async search(query: string, options?: { page?: number; limit?: number; sort?: string; filters?: any }) {
    const { page = 1, limit = 30, sort, filters } = options || {};
    const skip = (page - 1) * limit;
    
    const where: any = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
      ],
    };
    
    if (filters) {
      if (filters.priceMin) where.price = { gte: filters.priceMin };
      if (filters.priceMax) where.price = { ...where.price, lte: filters.priceMax };
    }
    
    const orderBy: any = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    if (sort === 'price_desc') orderBy.price = 'desc';
    if (sort === 'name_asc') orderBy.name = 'asc';
    if (sort === 'name_desc') orderBy.name = 'desc';
    if (sort === 'newest') orderBy.createdAt = 'desc';
    
    return this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: true,
        supplier: true,
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async getAnalytics() {
    const [totalProducts, activeProducts, totalCategories, totalSuppliers] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'active' } }),
      this.prisma.category.count(),
      this.prisma.supplier.count(),
    ]);

    return {
      totalProducts,
      activeProducts,
      totalCategories,
      totalSuppliers,
      productsByCategory: await this.prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        }
      })
    };
  }
}

