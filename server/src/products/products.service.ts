import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Fonction utilitaire pour traiter les images
  private processProductImages(product: any) {
    let imageUrls: string[] = [];
    let mainImage: string | null = null;

    if (product.images && product.images.length > 0) {
      // Images depuis la relation Prisma
      imageUrls = product.images.map(img => img.url);
      mainImage = imageUrls[0];
    } else if (product.image) {
      // Image stockée comme chaîne JSON ou URL simple
      try {
        if (typeof product.image === 'string' && product.image.startsWith('[')) {
          // Chaîne JSON
          const parsed = JSON.parse(product.image);
          if (Array.isArray(parsed)) {
            imageUrls = parsed;
            mainImage = parsed[0];
          }
        } else {
          // URL simple
          mainImage = product.image;
          imageUrls = [product.image];
        }
      } catch (e) {
        // Si le parsing échoue, utiliser l'image telle quelle
        mainImage = product.image;
        imageUrls = [product.image];
      }
    }

    // ✅ Nettoyer la description de TOUTES les balises HTML
    let cleanDescription = product.description;
    if (cleanDescription) {
      // Supprimer toutes les balises HTML
      cleanDescription = cleanDescription.replace(/<[^>]*>/g, '');
      // Remplacer les entités HTML communes
      cleanDescription = cleanDescription.replace(/&nbsp;/g, ' ');
      cleanDescription = cleanDescription.replace(/&amp;/g, '&');
      cleanDescription = cleanDescription.replace(/&lt;/g, '<');
      cleanDescription = cleanDescription.replace(/&gt;/g, '>');
      cleanDescription = cleanDescription.replace(/&quot;/g, '"');
      // Nettoyer les espaces multiples et les retours à la ligne
      cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
    }

    return {
      ...product,
      image: mainImage,
      images: imageUrls,
      description: cleanDescription
    };
  }

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
    const products = await this.prisma.product.findMany({
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

    // ✅ Transformer les données pour le frontend
    return products.map(product => this.processProductImages(product));
  }

  async findAllForAdmin() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true, // ✅ Ajouter la relation supplier
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ✅ Transformer les données pour le frontend
    return products.map(product => this.processProductImages(product));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
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

    if (!product) return null;

    // ✅ Transformer les données pour le frontend
    return this.processProductImages(product);
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
    const [pending, draft] = await Promise.all([
      this.prisma.product.count({ where: { status: 'pending' } }),
      this.prisma.product.count({ where: { status: 'draft' } }),
    ]);

    return {
      pending,
      draft,
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

