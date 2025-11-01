import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingProduct?: any;
  action: 'CREATE' | 'UPDATE' | 'SKIP';
  reason?: string;
}

export interface ImportStatusResult {
  status: 'new' | 'updated' | 'imported' | 'duplicate';
  productId?: string;
  changes?: string[];
}

@Injectable()
export class DuplicatePreventionService {
  private readonly logger = new Logger(DuplicatePreventionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Vérifier si un produit CJ existe déjà
   */
  async checkCJProductDuplicate(cjProductId: string, productSku?: string, productData?: any): Promise<DuplicateCheckResult> {
    this.logger.log(`🔍 Vérification doublons pour CJ Product ID: ${cjProductId}`);

    try {
      // 1️⃣ Recherche prioritaire par cjProductId (identifiant unique CJ)
      let existingProduct = await this.prisma.product.findFirst({
        where: { cjProductId },
        include: {
          category: true,
          supplier: true,
          cjMapping: true
        }
      });

      if (existingProduct) {
        this.logger.log(`🔄 Produit existant trouvé par cjProductId: ${existingProduct.id}`);
        return {
          isDuplicate: true,
          existingProduct,
          action: 'UPDATE',
          reason: `Produit CJ ${cjProductId} déjà importé (ID: ${existingProduct.id})`
        };
      }

      // 2️⃣ Recherche secondaire par productSku si fourni
      if (productSku) {
        existingProduct = await this.prisma.product.findFirst({
          where: { 
            productSku,
            source: 'cj-dropshipping' // Limiter à CJ pour éviter conflits inter-fournisseurs
          },
          include: {
            category: true,
            supplier: true,
            cjMapping: true
          }
        });

        if (existingProduct) {
          this.logger.log(`🔄 Produit existant trouvé par productSku: ${existingProduct.id}`);
          return {
            isDuplicate: true,
            existingProduct,
            action: 'UPDATE',
            reason: `Produit SKU ${productSku} déjà importé (ID: ${existingProduct.id})`
          };
        }
      }

      // 3️⃣ Recherche par similarité : nom + prix (détection de doublons potentiels)
      // Cette vérification permet de détecter les produits identiques avec des cjProductId différents
      if (productData?.name && productData?.price) {
        const normalizedName = productData.name.trim().toLowerCase();
        
        // SQLite ne supporte pas mode: 'insensitive', on doit récupérer tous les produits et filtrer
        const allCJProducts = await this.prisma.product.findMany({
          where: {
            source: 'cj-dropshipping',
            price: {
              // Tolérance de 0.01 pour les prix (arrondis)
              gte: productData.price - 0.01,
              lte: productData.price + 0.01
            }
          },
          include: {
            category: true,
            supplier: true,
            cjMapping: true
          }
        });
        
        // Filtrer par similarité de nom (insensible à la casse)
        const similarProduct = allCJProducts.find(p => {
          const existingName = p.name.trim().toLowerCase();
          // Vérifier si les noms sont similaires (contient ou similaire)
          return existingName.includes(normalizedName) || normalizedName.includes(existingName);
        });

        if (similarProduct) {
          // Comparer plus précisément le nom (au moins 80% de similitude)
          const existingName = similarProduct.name.trim().toLowerCase();
          const similarity = this.calculateSimilarity(normalizedName, existingName);
          
          if (similarity > 0.8) {
            this.logger.warn(`⚠️ Produit similaire détecté (similarité: ${Math.round(similarity * 100)}%): ${similarProduct.id}`);
            this.logger.warn(`   Produit existant: "${similarProduct.name}" (Prix: ${similarProduct.price})`);
            this.logger.warn(`   Produit à importer: "${productData.name}" (Prix: ${productData.price})`);
            
            return {
              isDuplicate: true,
              existingProduct: similarProduct,
              action: 'SKIP', // Ne pas mettre à jour, juste ignorer le doublon
              reason: `Produit similaire déjà importé (similarité: ${Math.round(similarity * 100)}%) - ${similarProduct.id}`
            };
          }
        }
      }

      // 4️⃣ Aucun doublon détecté
      this.logger.log(`✅ Aucun doublon détecté pour ${cjProductId}`);
      return {
        isDuplicate: false,
        action: 'CREATE',
        reason: 'Nouveau produit'
      };

    } catch (error) {
      this.logger.error(`❌ Erreur lors de la vérification de doublons:`, error);
      // En cas d'erreur, considérer comme nouveau pour ne pas bloquer l'import
      return {
        isDuplicate: false,
        action: 'CREATE',
        reason: 'Erreur de vérification - traité comme nouveau'
      };
    }
  }

  /**
   * Vérifier si un produit CJProductStore existe déjà
   */
  async checkCJStoreDuplicate(cjProductId: string): Promise<boolean> {
    try {
      const existing = await this.prisma.cJProductStore.findFirst({
        where: { cjProductId }
      });
      
      const isDuplicate = !!existing;
      this.logger.log(`🛒 Vérification magasin CJ ${cjProductId}: ${isDuplicate ? 'EXISTE' : 'NOUVEAU'}`);
      
      return isDuplicate;
    } catch (error) {
      this.logger.error(`❌ Erreur vérification magasin CJ:`, error);
      return false;
    }
  }

  /**
   * Calculer la similarité entre deux chaînes (algorithme de Jaro-Winkler simplifié)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Calculer la distance de Levenshtein
    const distance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - distance) / longer.length;
    
    return similarity;
  }

  /**
   * Distance de Levenshtein entre deux chaînes
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Upsert intelligent d'un produit CJ
   */
  async upsertCJProduct(productData: any, duplicateCheck: DuplicateCheckResult): Promise<ImportStatusResult> {
    try {
      // Si c'est un doublon à ignorer (SKIP), retourner directement
      if (duplicateCheck.action === 'SKIP' && duplicateCheck.existingProduct) {
        this.logger.log(`⏭️ Doublon ignoré: ${duplicateCheck.reason}`);
        return {
          status: 'duplicate',
          productId: duplicateCheck.existingProduct.id,
          changes: [`Doublon ignoré - ${duplicateCheck.reason}`]
        };
      }
      
      if (duplicateCheck.action === 'UPDATE' && duplicateCheck.existingProduct) {
        // 🔄 MISE À JOUR du produit existant
        this.logger.log(`🔄 Mise à jour du produit existant: ${duplicateCheck.existingProduct.id}`);
        
        const changes: string[] = [];
        const updateData: any = {
          updatedAt: new Date(),
          lastImportAt: new Date(),
          importStatus: 'updated'
        };

        // Vérifier et mettre à jour les champs qui ont changé
        if (duplicateCheck.existingProduct.price !== productData.price) {
          updateData.price = productData.price;
          changes.push(`prix: ${duplicateCheck.existingProduct.price} → ${productData.price}`);
        }

        if (duplicateCheck.existingProduct.stock !== productData.stock) {
          updateData.stock = productData.stock || 0;
          changes.push(`stock: ${duplicateCheck.existingProduct.stock} → ${productData.stock}`);
        }

        if (duplicateCheck.existingProduct.description !== productData.description) {
          updateData.description = productData.description;
          changes.push('description mise à jour');
        }

        // Mettre à jour tous les champs CJ spécifiques
        const cjFields = [
          'suggestSellPrice', 'variants', 'dimensions', 'brand', 'tags',
          'productWeight', 'packingWeight', 'materialNameEn', 'packingNameEn'
        ];
        
        cjFields.forEach(field => {
          if (productData[field] !== undefined) {
            updateData[field] = productData[field];
          }
        });

        const updatedProduct = await this.prisma.product.update({
          where: { id: duplicateCheck.existingProduct.id },
          data: updateData,
          include: {
            category: true,
            supplier: true
          }
        });

        this.logger.log(`✅ Produit mis à jour avec ${changes.length} changements`);
        
        return {
          status: 'updated',
          productId: updatedProduct.id,
          changes
        };

      } else {
        // 🆕 CRÉATION d'un nouveau produit
        this.logger.log(`🆕 Création d'un nouveau produit CJ`);
        
        const newProduct = await this.prisma.product.create({
          data: {
            ...productData,
            importStatus: 'new',
            lastImportAt: new Date(),
          },
          include: {
            category: true,
            supplier: true
          }
        });

        this.logger.log(`✅ Nouveau produit créé: ${newProduct.id}`);
        
        return {
          status: 'new',
          productId: newProduct.id,
          changes: ['Nouveau produit créé']
        };
      }

    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'upsert du produit:`, error);
      throw error;
    }
  }

  /**
   * Upsert intelligent d'un produit dans CJProductStore
   */
  async upsertCJStoreProduct(productData: any): Promise<{ isNew: boolean; productId: string }> {
    try {
      const result = await this.prisma.cJProductStore.upsert({
        where: { cjProductId: productData.cjProductId },
        update: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          image: productData.image,
          category: productData.category,
          // Mettre à jour tous les champs détaillés
          productSku: productData.productSku,
          productWeight: productData.productWeight,
          suggestSellPrice: productData.suggestSellPrice,
          variants: productData.variants,
          updatedAt: new Date()
        },
        create: productData
      });

      const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
      
      this.logger.log(`🛒 Produit magasin CJ ${isNew ? 'créé' : 'mis à jour'}: ${result.id}`);
      
      return {
        isNew,
        productId: result.id
      };

    } catch (error) {
      this.logger.error(`❌ Erreur upsert magasin CJ:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de doublons
   */
  async getDuplicateStats(): Promise<{
    totalProducts: number;
    cjProducts: number;
    duplicatesFound: number;
    lastImports: any[];
  }> {
    const [totalProducts, cjProducts, recentImports] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { source: 'cj-dropshipping' } }),
      this.prisma.product.findMany({
        where: { 
          lastImportAt: { not: null },
          source: 'cj-dropshipping'
        },
        orderBy: { lastImportAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          importStatus: true,
          lastImportAt: true,
          cjProductId: true
        }
      })
    ]);

    const duplicatesFound = recentImports.filter(p => p.importStatus === 'updated').length;

    return {
      totalProducts,
      cjProducts,
      duplicatesFound,
      lastImports: recentImports
    };
  }
}