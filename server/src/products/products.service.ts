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
      where: {
        status: 'active' // Seuls les produits validés
      },
      include: {
        category: true,
        supplier: true, // ✅ Ajouter la relation supplier
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllForAdmin() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true, // ✅ Ajouter la relation supplier
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
        supplier: true, // ✅ Ajouter la relation supplier
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

  async approve(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async reject(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async getPendingProducts() {
    return this.prisma.product.findMany({
      where: { 
        status: { in: ['pending', 'draft'] } // ✅ Inclure les produits draft (CJ)
      },
      include: {
        category: true,
        supplier: true,
        cjMapping: true, // ✅ Inclure le mapping CJ
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProductsReadyForValidation(categoryId?: string) {
    // Récupérer tous les produits pending et draft
    const products = await this.prisma.product.findMany({
      where: { 
        status: { in: ['pending', 'draft'] } // ✅ Inclure les produits draft (CJ)
      },
      include: {
        category: true,
        supplier: {
          include: {
            categoryMappings: true
          }
        },
        cjMapping: true, // ✅ Inclure le mapping CJ
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Récupérer tous les mappings de catégories
    const categoryMappings = await this.prisma.categoryMapping.findMany();
    
    // Filtrer pour ne garder que ceux qui ont un mapping pour leur catégorie externe
    let filteredProducts = products.filter(product => {
      if (!product.supplier || !product.externalCategory) return false;
      
      // Vérifier si ce produit a un mapping pour sa catégorie externe
      const hasMapping = categoryMappings.some(mapping => 
        mapping.supplierId === product.supplierId && 
        mapping.externalCategory === product.externalCategory
      );
      
      return hasMapping;
    });

    // Si une catégorie spécifique est demandée, filtrer par cette catégorie
    if (categoryId) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.supplier || !product.externalCategory) return false;
        
        // Trouver le mapping pour ce produit
        const mapping = categoryMappings.find(mapping => 
          mapping.supplierId === product.supplierId && 
          mapping.externalCategory === product.externalCategory
        );
        
        return mapping && mapping.internalCategory === categoryId;
      });
    }

    return filteredProducts;
  }

  // ✅ Nouvelle méthode pour obtenir les produits par source
  async getProductsBySource(source?: string) {
    const whereClause: any = {
      status: { in: ['pending', 'draft'] }
    };

    if (source) {
      whereClause.source = source;
    }

    return this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        supplier: true,
        cjMapping: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ✅ Nouvelle méthode pour obtenir les statistiques de validation
  async getValidationStats() {
    const [pending, draft, cjProducts, dummyProducts] = await Promise.all([
      this.prisma.product.count({ where: { status: 'pending' } }),
      this.prisma.product.count({ where: { status: 'draft' } }),
      this.prisma.product.count({ where: { source: 'cj-dropshipping' } }),
      this.prisma.product.count({ where: { source: 'dummy-json' } }),
    ]);

    return {
      pending,
      draft,
      cjProducts,
      dummyProducts,
      total: pending + draft,
    };
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
}

