import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Fonction utilitaire pour traiter les images et formater la description
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

    // ✅ Formater la description avec une structure claire
    let formattedDescription = product.description;
    if (formattedDescription) {
      // Supprimer toutes les balises HTML
      formattedDescription = formattedDescription.replace(/<[^>]*>/g, '');
      // Remplacer les entités HTML communes
      formattedDescription = formattedDescription.replace(/&nbsp;/g, ' ');
      formattedDescription = formattedDescription.replace(/&amp;/g, '&');
      formattedDescription = formattedDescription.replace(/&lt;/g, '<');
      formattedDescription = formattedDescription.replace(/&gt;/g, '>');
      formattedDescription = formattedDescription.replace(/&quot;/g, '"');
      
      // ✅ Structurer la description avec des sauts de ligne
      // Remplacer les parenthèses ouvrantes par des sauts de ligne
      formattedDescription = formattedDescription.replace(/\(/g, '\n\n• ');
      // Remplacer les crochets chinois par des sauts de ligne
      formattedDescription = formattedDescription.replace(/【/g, '\n\n🌸 ');
      formattedDescription = formattedDescription.replace(/】/g, '');
      
      // Nettoyer les espaces multiples
      formattedDescription = formattedDescription.replace(/\s+/g, ' ');
      // Nettoyer les sauts de ligne multiples
      formattedDescription = formattedDescription.replace(/\n\s*\n/g, '\n\n');
      // Supprimer les espaces en début et fin de ligne
      formattedDescription = formattedDescription.split('\n').map(line => line.trim()).join('\n');
      // Supprimer les lignes vides en début et fin
      formattedDescription = formattedDescription.trim();
    }

    return {
      ...product,
      image: mainImage,
      images: imageUrls,
      description: formattedDescription
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

  // ✅ MÉTHODES CJ DROPSHIPPING
  private readonly CJ_API_BASE = 'https://api.cjdropshipping.com/api2.0/v1';
  private readonly CJ_API_KEY = process.env.CJ_API_KEY;

  async searchCJProducts(params: any) {
    try {
      // Construire les paramètres de recherche pour l'API CJ
      const searchParams = {
        productName: params.productName || '',
        categoryId: params.categoryId || '',
        minPrice: params.minPrice || 0,
        maxPrice: params.maxPrice || 999999,
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 50,
        countryCode: params.countryCode || 'US',
        sort: params.sort || 'DESC',
        orderBy: params.orderBy || 'listedNum'
      };

      // Appel à l'API CJ Dropshipping
      const response = await fetch(`${this.CJ_API_BASE}/product/list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CJ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`CJ API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les données pour le frontend
      return {
        success: true,
        data: {
          list: data.data?.list || [],
          total: data.data?.total || 0,
          pageNum: data.data?.pageNum || 1,
          pageSize: data.data?.pageSize || 50
        }
      };
    } catch (error) {
      console.error('Erreur recherche CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: { list: [], total: 0 }
      };
    }
  }

  async getCJCategories() {
    try {
      const response = await fetch(`${this.CJ_API_BASE}/product/getCategory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CJ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`CJ API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Erreur récupération catégories CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: []
      };
    }
  }

  async getCJProductDetails(pid: string) {
    try {
      const response = await fetch(`${this.CJ_API_BASE}/product/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CJ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid }),
      });

      if (!response.ok) {
        throw new Error(`CJ API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erreur détails produit CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: null
      };
    }
  }

  async importCJProduct(importData: any) {
    try {
      const { pid, variantSku, categoryId, supplierId } = importData;

      // Vérifier si le produit existe déjà
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          cjMapping: {
            cjProductId: pid,
            cjSku: variantSku
          }
        }
      });

      if (existingProduct) {
        return {
          success: false,
          error: 'Ce produit CJ est déjà importé',
          data: existingProduct
        };
      }

      // Récupérer les détails du produit depuis CJ
      const cjDetails = await this.getCJProductDetails(pid);
      if (!cjDetails.success) {
        throw new Error('Impossible de récupérer les détails du produit CJ');
      }

      const cjProduct = cjDetails.data;
      const variant = cjProduct.variants?.find(v => v.variantSku === variantSku);

      if (!variant) {
        throw new Error('Variante non trouvée');
      }

      // Créer le produit dans la base locale avec statut 'draft'
      const product = await this.prisma.product.create({
        data: {
          name: cjProduct.productNameEn || cjProduct.productName,
          description: cjProduct.productDescriptionEn || cjProduct.productDescription,
          price: parseFloat(variant.sellPrice) || 0,
          originalPrice: parseFloat(variant.originalPrice) || 0,
          image: JSON.stringify(cjProduct.productImage || []),
          categoryId,
          supplierId,
          externalCategory: cjProduct.categoryName,
          source: 'cj-dropshipping',
          status: 'draft',
          stock: variant.stock || 0,
          cjMapping: {
            create: {
              cjProductId: pid,
              cjSku: variantSku
            }
          }
        },
        include: {
          category: true,
          supplier: true,
          cjMapping: true
        }
      });

      return {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('Erreur import produit CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: null
      };
    }
  }

  async getCJProductStock(pid: string, countryCode: string = 'US') {
    try {
      const response = await fetch(`${this.CJ_API_BASE}/product/stock/getInventoryByPid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CJ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pid,
          countryCode 
        }),
      });

      if (!response.ok) {
        throw new Error(`CJ API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Erreur stock produit CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        data: []
      };
    }
  }
}

