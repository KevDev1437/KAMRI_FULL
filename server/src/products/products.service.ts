import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PrepareProductDto } from './dto/prepare-product.dto';
import { EditProductDto } from './dto/edit-product.dto';

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

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async approve(id: string) {
    // ✅ Unifié : utiliser publishProduct pour draft → active
    return this.publishProduct(id);
  }

  async reject(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async getPendingProducts() {
    // ✅ Unifié : retourner uniquement les produits draft
    return this.prisma.product.findMany({
      where: { 
        status: 'draft' // ✅ Unifié : uniquement draft
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
    // ✅ Unifié : récupérer uniquement les produits draft
    const products = await this.prisma.product.findMany({
      where: { 
        status: 'draft' // ✅ Unifié : uniquement draft
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
      status: 'draft' // ✅ Unifié : uniquement draft
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
    // ✅ Unifié : compter uniquement les produits draft
    const draft = await this.prisma.product.count({ where: { status: 'draft' } });

    return {
      draft,
      total: draft, // ✅ Unifié : uniquement draft
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

  // ===== NOUVELLES MÉTHODES POUR L'ÉDITION MANUELLE =====

  /**
   * Nettoyer le nom d'un produit
   */
  private cleanProductName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/\s+/g, ' ') // Espaces multiples
      .replace(/[^\w\s-]/gi, '') // Caractères spéciaux (sauf tirets)
      .substring(0, 200); // Limite de longueur
  }

  /**
   * Nettoyer la description d'un produit
   */
  private cleanProductDescription(description: string): string {
    if (!description) return '';
    
    // Supprimer les balises HTML
    let cleaned = description
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim();
    
    return cleaned;
  }

  /**
   * Calculer le prix avec marge
   */
  private calculatePriceWithMargin(originalPrice: number, margin: number): number {
    if (!originalPrice || originalPrice <= 0) return 0;
    return originalPrice * (1 + margin / 100);
  }

  /**
   * Préparer un produit CJ pour publication
   * Crée un Product (draft) depuis CJProductStore
   */
  /**
   * Mapper automatiquement une catégorie externe vers une catégorie interne
   */
  private async mapExternalCategory(externalCategory: string, supplierId: string): Promise<string | null> {
    if (!externalCategory || !supplierId) {
      return null;
    }

    console.log(`🔍 [MAP-CATEGORY] Recherche mapping pour: "${externalCategory}" (Supplier: ${supplierId})`);

    // Vérifier s'il existe un mapping pour cette catégorie externe
    const existingMapping = await this.prisma.categoryMapping.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: externalCategory
      }
    });

    if (existingMapping) {
      console.log(`✅ [MAP-CATEGORY] Mapping trouvé: ${externalCategory} → ${existingMapping.internalCategory}`);
      
      // Vérifier si internalCategory est un ID valide
      const category = await this.prisma.category.findUnique({
        where: { id: existingMapping.internalCategory }
      });

      if (category) {
        console.log(`✅ [MAP-CATEGORY] Catégorie interne trouvée: ${category.name} (ID: ${category.id})`);
        return category.id;
      } else {
        console.warn(`⚠️ [MAP-CATEGORY] Catégorie interne non trouvée pour ID: ${existingMapping.internalCategory}`);
      }
    } else {
      console.log(`❌ [MAP-CATEGORY] Aucun mapping trouvé pour "${externalCategory}"`);
    }

    return null;
  }

  async prepareCJProductForPublication(
    cjStoreProductId: string,
    prepareData: PrepareProductDto,
    userId?: string
  ) {
    console.log('🚀 [PREPARE] Début préparation produit:', { cjStoreProductId, prepareData, userId });
    
    // 1. Récupérer le produit depuis CJProductStore
    const cjProduct = await this.prisma.cJProductStore.findUnique({
      where: { id: cjStoreProductId }
    });

    if (!cjProduct) {
      console.error('❌ [PREPARE] Produit CJ non trouvé:', cjStoreProductId);
      throw new NotFoundException('Produit CJ non trouvé dans le magasin');
    }

    console.log('✅ [PREPARE] Produit CJ trouvé:', { id: cjProduct.id, name: cjProduct.name, cjProductId: cjProduct.cjProductId });

    // 2. Vérifier si le produit n'est pas déjà dans Product
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        cjProductId: cjProduct.cjProductId
      }
    });

    if (existingProduct) {
      console.warn('⚠️ [PREPARE] Produit déjà dans le catalogue:', existingProduct.id);
      throw new BadRequestException('Ce produit CJ est déjà dans le catalogue');
    }

    // 3. ✅ NOUVEAU : Vérifier le mapping de catégorie automatiquement
    let categoryId = prepareData.categoryId;
    if (prepareData.supplierId && cjProduct.category) {
      const mappedCategoryId = await this.mapExternalCategory(cjProduct.category, prepareData.supplierId);
      if (mappedCategoryId) {
        console.log(`✅ [PREPARE] Catégorie mappée automatiquement: ${cjProduct.category} → ${mappedCategoryId}`);
        categoryId = mappedCategoryId; // Utiliser la catégorie mappée si elle existe
      } else {
        console.log(`⚠️ [PREPARE] Aucun mapping trouvé, utilisation de la catégorie fournie: ${prepareData.categoryId}`);
      }
    }

    // 4. Nettoyage automatique (Niveau 1)
    const cleanedName = this.cleanProductName(cjProduct.name);
    const cleanedDescription = this.cleanProductDescription(cjProduct.description || '');
    const margin = prepareData.margin || 30;
    const originalPrice = cjProduct.originalPrice || cjProduct.price;
    const calculatedPrice = this.calculatePriceWithMargin(originalPrice, margin);

    // 5. Préparer les données pour Product
    const productData: any = {
      name: cleanedName,
      description: cleanedDescription,
      price: calculatedPrice,
      originalPrice: originalPrice,
      image: cjProduct.image,
      categoryId: categoryId, // ✅ Utiliser la catégorie mappée ou celle fournie
      supplierId: prepareData.supplierId,
      externalCategory: cjProduct.category,
      source: 'cj-dropshipping',
      status: 'draft', // Statut draft pour édition
      margin: margin,
      stock: 0, // Par défaut, sera mis à jour si nécessaire
      
      // Données CJ détaillées
      cjProductId: cjProduct.cjProductId,
      productSku: cjProduct.productSku,
      productWeight: cjProduct.productWeight,
      packingWeight: cjProduct.packingWeight,
      productType: cjProduct.productType,
      productUnit: cjProduct.productUnit,
      productKeyEn: cjProduct.productKeyEn,
      materialNameEn: cjProduct.materialNameEn,
      packingNameEn: cjProduct.packingNameEn,
      suggestSellPrice: cjProduct.suggestSellPrice,
      listedNum: cjProduct.listedNum,
      supplierName: cjProduct.supplierName,
      createrTime: cjProduct.createrTime,
      variants: cjProduct.variants,
      cjReviews: cjProduct.reviews,
      dimensions: cjProduct.dimensions,
      brand: cjProduct.brand,
      tags: cjProduct.tags,
    };

    console.log('💾 [PREPARE] Données du produit à créer:', {
      name: productData.name,
      price: productData.price,
      status: productData.status,
      categoryId: productData.categoryId,
      cjProductId: productData.cjProductId
    });

    // 5. Créer le Product (draft)
    try {
      const product = await this.prisma.product.create({
        data: {
          ...productData,
          cjMapping: {
            create: {
              cjProductId: cjProduct.cjProductId,
              cjSku: cjProduct.productSku || cjProduct.cjProductId
            }
          }
        },
        include: {
          category: true,
          supplier: true,
          cjMapping: true
        }
      });

      console.log('✅ [PREPARE] Produit créé avec succès:', {
        id: product.id,
        name: product.name,
        status: product.status,
        categoryId: product.categoryId
      });

      // 6. Marquer comme importé dans CJProductStore
      await this.prisma.cJProductStore.update({
        where: { id: cjStoreProductId },
        data: { status: 'imported' }
      });

      console.log('✅ [PREPARE] Produit CJ marqué comme importé');

      return product;
    } catch (error) {
      console.error('❌ [PREPARE] Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  /**
   * Éditer un produit en draft
   */
  async editDraftProduct(
    id: string,
    editData: EditProductDto,
    userId?: string
  ) {
    // 1. Vérifier que le produit existe et est en draft
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.status !== 'draft') {
      throw new BadRequestException('Seuls les produits en draft peuvent être édités');
    }

    // 2. Préparer les données de mise à jour
    const updateData: any = {};

    // Nom
    if (editData.name !== undefined) {
      updateData.name = this.cleanProductName(editData.name);
    }

    // Description
    if (editData.description !== undefined) {
      updateData.description = this.cleanProductDescription(editData.description);
    }

    // Marge et prix
    if (editData.margin !== undefined) {
      updateData.margin = editData.margin;
      // Recalculer le prix si originalPrice existe
      if (product.originalPrice) {
        updateData.price = this.calculatePriceWithMargin(product.originalPrice, editData.margin);
      }
    }

    // Catégorie
    if (editData.categoryId !== undefined) {
      updateData.categoryId = editData.categoryId;
    }

    // Image
    if (editData.image !== undefined) {
      updateData.image = editData.image;
    }

    // Images multiples (si fourni)
    if (editData.images !== undefined && editData.images.length > 0) {
      // Supprimer les anciennes images
      await this.prisma.image.deleteMany({
        where: { productId: id }
      });

      // Créer les nouvelles images
      await this.prisma.image.createMany({
        data: editData.images.map((url, index) => ({
          productId: id,
          url: url,
          alt: `${product.name} - Image ${index + 1}`
        }))
      });
    }

    // Badge
    if (editData.badge !== undefined) {
      updateData.badge = editData.badge;
    }

    // Stock
    if (editData.stock !== undefined) {
      updateData.stock = editData.stock;
    }

    // Marquer comme édité
    updateData.isEdited = true;
    updateData.editedAt = new Date();
    if (userId) {
      updateData.editedBy = userId;
    }

    // 3. Mettre à jour le produit
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        supplier: true,
        images: true,
        cjMapping: true
      }
    });

    return updatedProduct;
  }

  /**
   * Publier un produit draft (passer à active)
   */
  async publishProduct(id: string) {
    // 1. Vérifier que le produit existe et est en draft
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.status !== 'draft') {
      throw new BadRequestException('Seuls les produits en draft peuvent être publiés');
    }

    // 2. Vérifications avant publication
    if (!product.categoryId) {
      throw new BadRequestException('Une catégorie est requise pour publier le produit');
    }

    if (!product.name || product.name.trim() === '') {
      throw new BadRequestException('Un nom est requis pour publier le produit');
    }

    if (product.price <= 0) {
      throw new BadRequestException('Un prix valide est requis pour publier le produit');
    }

    // 3. Passer à active
    const publishedProduct = await this.prisma.product.update({
      where: { id },
      data: { status: 'active' },
      include: {
        category: true,
        supplier: true,
        images: true,
        cjMapping: true
      }
    });

    return publishedProduct;
  }

  /**
   * Obtenir tous les produits en draft (pour édition)
   */
  async getDraftProducts() {
    console.log('📋 [GET-DRAFT] Récupération des produits draft...');
    
    const products = await this.prisma.product.findMany({
      where: {
        status: 'draft'
      },
      include: {
        category: true,
        supplier: true,
        images: true,
        productVariants: true, // ✅ Inclure les variants
        cjMapping: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 [GET-DRAFT] ${products.length} produit(s) draft trouvé(s)`);
    if (products.length > 0) {
      console.log('📋 [GET-DRAFT] Produits:', products.map(p => ({ id: p.id, name: p.name, status: p.status })));
    }
    
    return products;
  }

  /**
   * Obtenir un produit draft par ID
   */
  async getDraftProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, status: 'draft' },
      include: {
        category: true,
        supplier: true,
        images: true,
        productVariants: true, // ✅ Inclure les variants
        cjMapping: true
      }
    });

    if (!product) {
      throw new NotFoundException('Produit draft non trouvé');
    }

    return product;
  }

  /**
   * Mettre à jour automatiquement les produits draft sans catégorie qui ont un mapping
   */
  async updateDraftProductsWithMapping() {
    console.log('🔄 [UPDATE-DRAFT] Mise à jour des produits draft sans catégorie...');

    // Récupérer tous les produits draft sans catégorie
    const draftProductsWithoutCategory = await this.prisma.product.findMany({
      where: {
        status: 'draft',
        categoryId: null,
        externalCategory: { not: null },
        supplierId: { not: null }
      },
      include: {
        supplier: true
      }
    });

    console.log(`📋 [UPDATE-DRAFT] ${draftProductsWithoutCategory.length} produit(s) draft sans catégorie trouvé(s)`);

    let updatedCount = 0;

    for (const product of draftProductsWithoutCategory) {
      if (!product.externalCategory || !product.supplierId) {
        continue;
      }

      // Vérifier le mapping
      const mappedCategoryId = await this.mapExternalCategory(product.externalCategory, product.supplierId);

      if (mappedCategoryId) {
        // Mettre à jour le produit avec la catégorie mappée
        await this.prisma.product.update({
          where: { id: product.id },
          data: { categoryId: mappedCategoryId }
        });

        console.log(`✅ [UPDATE-DRAFT] Produit ${product.id} mis à jour avec catégorie: ${mappedCategoryId}`);
        updatedCount++;
      }
    }

    console.log(`✅ [UPDATE-DRAFT] ${updatedCount} produit(s) mis à jour avec succès`);

    return {
      total: draftProductsWithoutCategory.length,
      updated: updatedCount
    };
  }

  // ===== NOTIFICATIONS DE MISE À JOUR DE PRODUITS =====

  async getUpdateNotifications(unreadOnly: boolean = false, limit: number = 50) {
    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await this.prisma.productUpdateNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Parser les changements JSON
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      changes: notif.changes ? JSON.parse(notif.changes) : []
    }));

    return {
      notifications: formattedNotifications,
      total: await this.prisma.productUpdateNotification.count({ where }),
      unreadCount: await this.prisma.productUpdateNotification.count({ where: { isRead: false } })
    };
  }

  async markNotificationAsRead(id: string) {
    return this.prisma.productUpdateNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllNotificationsAsRead() {
    const result = await this.prisma.productUpdateNotification.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return {
      updated: result.count
    };
  }
}

