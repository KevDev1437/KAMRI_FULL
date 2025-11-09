import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DuplicatePreventionService } from '../../common/services/duplicate-prevention.service';
import { CJAPIClient } from '../cj-api-client';

@Injectable()
export class CJFavoriteService {
  private readonly logger = new Logger(CJFavoriteService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient,
    private duplicateService: DuplicatePreventionService
  ) {}

  /**
   * Initialiser le client CJ avec la configuration
   */
  private async initializeClient(): Promise<CJAPIClient> {
    this.logger.log('🚀 Initialisation du client CJ...');
    
    const config = await this.prisma.cJConfig.findFirst();
    if (!config?.enabled) {
      throw new Error('L\'intégration CJ Dropshipping est désactivée');
    }

    // Initialiser la configuration du client injecté
    this.cjApiClient.setConfig({
      email: config.email,
      apiKey: config.apiKey,
      tier: config.tier as 'free' | 'plus' | 'prime' | 'advanced',
      platformToken: config.platformToken,
      debug: process.env.CJ_DEBUG === 'true',
    });

    // ✅ Essayer de charger le token depuis la base de données
    const tokenLoaded = await this.cjApiClient.loadTokenFromDatabase();
    
    if (!tokenLoaded) {
      // Si le token n'est pas en base ou est expiré, faire un login (dernier recours)
      this.logger.log('🔑 Token non trouvé en base ou expiré - Login CJ requis');
      await this.cjApiClient.login();
      this.logger.log('✅ Login CJ réussi');
    } else {
      this.logger.log('✅ Token CJ chargé depuis la base de données - Utilisation de la connexion existante');
    }
    
    return this.cjApiClient;
  }

  /**
   * Récupère la liste de mes produits (favoris CJ)
   */
  async getMyProducts(params: {
    keyword?: string;
    categoryId?: string;
    startAt?: string;
    endAt?: string;
    isListed?: number;
    visiable?: number;
    hasPacked?: number;
    hasVirPacked?: number;
  } = {}): Promise<{ success: boolean; products: any[]; total: number }> {
    this.logger.log('📦 === DÉBUT RÉCUPÉRATION FAVORIS CJ ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(params, null, 2));
    
    try {
      const client = await this.initializeClient();
      this.logger.log('🔗 Client CJ initialisé, appel API...');
      
      // 🔄 RÉCUPÉRATION SIMPLIFIÉE : Maximum 10 favoris (1 page)
      this.logger.log('📦 Récupération des favoris CJ (limité à 10)...');
        
      const result = await client.makeRequest('GET', '/product/myProduct/query', {
        pageNumber: 1,
        pageSize: 10 // Limite fixe de l'API CJ
      });
        
      if (result.code !== 200) {
        this.logger.error('❌ Erreur récupération favoris:', result.message);
        return {
          success: false,
          products: [],
          total: 0
        };
      }
      
      const data = result.data as any;
      const totalRecords = data.totalRecords || 0;
      const favorites = data.content || [];
      
      this.logger.log(`📦 Page 1: ${favorites.length} favoris récupérés`);
      this.logger.log(`📊 Total API: ${totalRecords} favoris`);
      
      // Utiliser les données récupérées
      const responseData = {
        totalRecords: totalRecords,
        content: favorites
      };
      
      // Traitement des données récupérées
      if (responseData.totalRecords > 0) {
        this.logger.log(`✅ ${responseData.totalRecords} favoris trouvés`);
        
        // Transformer les données selon la structure CJ (myProduct/query API)
        const transformedProducts = responseData.content.map((product: any) => {
          return {
            pid: product.productId,
            productName: product.nameEn || product.productName,
            productNameEn: product.nameEn || product.productName,
            productSku: product.sku || product.productSku,
            sellPrice: product.sellPrice,
            productImage: product.bigImage || product.productImage,
            categoryName: product.defaultArea || product.categoryName || 'CJ Dropshipping',
            description: this.cleanDescription(product.description || ''),
            variants: product.variants || [],
            rating: product.rating || 0,
            totalReviews: product.totalReviews || product.reviews?.length || 0,
            weight: product.weight || product.productWeight || 0,
            dimensions: product.dimensions || '',
            brand: product.brand || '',
            tags: product.tags || [],
            reviews: product.reviews || [],
            // Informations supplémentaires comme dans le script test
            productWeight: product.productWeight,
            packingWeight: product.packingWeight,
            productType: product.productType,
            productUnit: product.productUnit,
            productKeyEn: product.productKeyEn,
            materialNameEn: product.materialNameEn,
            packingNameEn: product.packingNameEn,
            suggestSellPrice: product.suggestSellPrice,
            listedNum: product.listedNum,
            supplierName: product.supplierName,
            createrTime: product.createrTime,
            status: product.status
          };
        });
        
        return {
          success: true,
          products: transformedProducts,
          total: responseData.totalRecords
        };
      } else {
        this.logger.log('ℹ️ Aucun favori trouvé');
        return {
          success: true,
          products: [],
          total: 0
        };
      }
    } catch (error) {
      this.logger.error('❌ === ERREUR RÉCUPÉRATION FAVORIS ===');
      this.logger.error(`💥 Erreur: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR RÉCUPÉRATION FAVORIS ===');
      throw error;
    }
  }

  /**
   * Synchroniser les favoris CJ avec KAMRI
   */
  async syncFavorites(): Promise<{ success: boolean; synced: number; message: string }> {
    this.logger.log('🔄 === DÉBUT SYNCHRONISATION FAVORIS CJ ===');
    this.logger.log('📝 Étape 1: Récupération des favoris depuis CJ...');
    
    try {
      // Récupérer tous les favoris CJ
      const favorites = await this.getMyProducts();
      
      this.logger.log('📊 Résultat getMyProducts:', {
        success: favorites.success,
        totalProducts: favorites.products?.length || 0,
        total: favorites.total || 0
      });
      
      if (!favorites.success) {
        this.logger.error('❌ Échec de la récupération des favoris CJ');
        return {
          success: false,
          synced: 0,
          message: 'Erreur lors de la récupération des favoris CJ'
        };
      }
      
      if (favorites.products.length === 0) {
        this.logger.log('ℹ️ Aucun favori CJ trouvé');
        return {
          success: true,
          synced: 0,
          message: 'Aucun favori CJ trouvé'
        };
      }

      // 🔧 CORRECTION : Dédoublonner une dernière fois avant import
      const uniqueFavorites = favorites.products.filter((product: any, index: number, self: any[]) => 
        index === self.findIndex(p => p.pid === product.pid)
      );
      
      // 🔍 DEBUG : Analyser les doublons
      this.logger.log(`🔍 Analyse des doublons:`);
      this.logger.log(`📊 Total avant dédoublonnage: ${favorites.products.length}`);
      this.logger.log(`📊 Total après dédoublonnage: ${uniqueFavorites.length}`);
      
      // Vérifier les PIDs pour identifier les doublons
      const pids = favorites.products.map(p => p.pid);
      const uniquePids = [...new Set(pids)];
      this.logger.log(`📊 PIDs uniques: ${uniquePids.length}, PIDs totaux: ${pids.length}`);
      
      if (pids.length !== uniquePids.length) {
        this.logger.log(`⚠️ DOUBLONS DÉTECTÉS dans les PIDs`);
        const duplicates = pids.filter((pid, index) => pids.indexOf(pid) !== index);
        this.logger.log(`🔄 PIDs dupliqués: ${duplicates.join(', ')}`);
      }
      
      console.log(`🔍 Favoris finaux dédoublonnés: ${favorites.products.length} → ${uniqueFavorites.length}`);
      
      this.logger.log(`📦 ${uniqueFavorites.length} favoris uniques trouvés, début de l'import...`);
      console.log(`🚀 === DÉBUT IMPORT DES FAVORIS ===`);
      console.log(`📊 Total favoris à importer: ${uniqueFavorites.length}`);
      
      let synced = 0;
      const errors = [];

      // Importer chaque favori vers KAMRI (marquer comme favori)
      for (let i = 0; i < uniqueFavorites.length; i++) {
        const favorite = uniqueFavorites[i];
        this.logger.log(`🔄 Traitement favori ${i + 1}/${uniqueFavorites.length}: ${favorite.nameEn || favorite.productName || 'Sans nom'}`);
        
        console.log(`\n📦 === FAVORI ${i + 1}/${uniqueFavorites.length} ===`);
        console.log(`📝 Nom: ${favorite.nameEn || favorite.productName || 'Sans nom'}`);
        console.log(`📝 SKU: ${favorite.productSku}`);
        console.log(`📝 ProductId: ${favorite.pid}`);
        console.log(`📝 Prix: ${favorite.sellPrice}`);
        console.log(`📝 Image: ${favorite.productImage ? '✅' : '❌'}`);
        
        try {
          this.logger.log(`📝 Import du favori: PID=${favorite.pid}, SKU=${favorite.productSku}`);
          const importResult = await this.importProduct(favorite.pid, undefined, 0, true); // isFavorite = true, marge = 0
          synced++;
          console.log(`✅ Favori ${i + 1} importé avec succès`);
          this.logger.log(`✅ Favori ${i + 1} importé avec succès: ${favorite.nameEn || favorite.productName}`);
          
          // Attendre entre les imports pour éviter le rate limiting
          if (i < uniqueFavorites.length - 1) {
            console.log(`⏳ Attente 3 secondes avant le prochain import...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          errors.push(favorite.productSku || favorite.pid);
          console.log(`❌ Erreur import favori ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
          this.logger.error(`❌ Erreur import favori ${i + 1} (${favorite.productSku || favorite.pid}):`, error);
          
          // Attendre même en cas d'erreur pour éviter le rate limiting
          if (i < uniqueFavorites.length - 1) {
            console.log(`⏳ Attente 3 secondes après erreur...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }

      this.logger.log('📊 === RÉSULTAT SYNCHRONISATION ===');
      this.logger.log(`✅ Favoris importés: ${synced}`);
      this.logger.log(`❌ Erreurs: ${errors.length}`);
      
      console.log(`\n🎉 === RÉSULTAT FINAL SYNCHRONISATION ===`);
      console.log(`✅ Favoris importés avec succès: ${synced}`);
      console.log(`❌ Erreurs d'import: ${errors.length}`);
      console.log(`📊 Total traités: ${uniqueFavorites.length}`);
      console.log(`📊 Taux de succès: ${((synced / uniqueFavorites.length) * 100).toFixed(1)}%`);
      
      if (errors.length > 0) {
        console.log(`\n❌ Erreurs détaillées:`);
        errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
        this.logger.log('🔍 Erreurs détaillées:', errors);
      }

      return {
        success: true,
        synced,
        message: `${synced} favoris importés avec succès${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`
      };
    } catch (error) {
      this.logger.error('❌ === ERREUR CRITIQUE SYNCHRONISATION FAVORIS ===');
      this.logger.error(`💥 Erreur: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR SYNCHRONISATION ===');
      
      return {
        success: false,
        synced: 0,
        message: `Erreur synchronisation: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Importer un produit CJ vers KAMRI
   */
  async importProduct(pid: string, categoryId?: string, margin: number = 0, isFavorite: boolean = false): Promise<any> {
    this.logger.log('🔍 === DÉBUT IMPORT PRODUIT CJ ===');
    this.logger.log('📝 Paramètres:', { pid, categoryId, margin, isFavorite });
    
    // 🚨 VALIDATION : Rejeter les PID invalides
    if (!pid || 
        pid === 'undefined' || 
        pid === 'null' || 
        pid === 'imported' || 
        pid === 'available' || 
        pid === 'selected' || 
        pid === 'pending' ||
        pid.trim() === '') {
      this.logger.error(`❌ PID invalide reçu: "${pid}" - Ignoré pour éviter les appels API inutiles`);
      this.logger.error('🔍 Stack trace:', new Error().stack);
      return {
        success: false,
        message: `PID invalide: "${pid}" - Ce n'est pas un ID de produit CJ valide`,
        product: null
      };
    }
    
    try {
      this.logger.log('🔗 Initialisation du client CJ...');
      const client = await this.initializeClient();
      
      this.logger.log('📦 Récupération des détails du produit CJ...');
      
      // 🔧 UTILISER LA MÊME LOGIQUE QUE getProductDetails
      const result = await client.makeRequest('GET', `/product/query?pid=${pid}`);
      
      if (result.code !== 200) {
        this.logger.error(`❌ Erreur détails produit ${pid}:`, result.message);
        
        // ✅ Gérer spécifiquement le cas où le produit a été retiré des étagères
        if (result.message && result.message.includes('removed from shelves')) {
          return {
            success: false,
            message: `Ce produit a été retiré des étagères de CJ Dropshipping (PID: ${pid}). Il n'est plus disponible à l'import.`,
            product: null,
            errorCode: 'PRODUCT_REMOVED'
          };
        }
        
        // ✅ Gérer les autres erreurs
        throw new Error(result.message || 'Erreur lors de la récupération des détails du produit');
      }
      
      const cjProduct = result.data;
      
      this.logger.log('📦 Produit CJ récupéré:', {
        name: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        price: (cjProduct as any).sellPrice,
        category: (cjProduct as any).categoryName,
        hasImage: !!(cjProduct as any).productImage
      });
      
      // Créer le produit KAMRI
      // 🔧 CORRECTION : Gérer les prix avec plage (ex: "2.4-12.81")
      let originalPrice = 0;
      const priceStr = String((cjProduct as any).sellPrice || '');
      console.log(`💰 Prix brut reçu: "${priceStr}" (type: ${typeof (cjProduct as any).sellPrice})`);
      
      if (priceStr.includes('-')) {
        // Prendre le prix minimum de la plage
        const priceRange = priceStr.split('-');
        originalPrice = Number(priceRange[0]) || 0;
        console.log(`💰 Prix plage détectée: ${priceRange[0]} → ${originalPrice}`);
      } else {
        originalPrice = Number(priceStr) || 0;
        console.log(`💰 Prix simple: ${priceStr} → ${originalPrice}`);
      }
      const sellingPrice = originalPrice; // Utiliser le prix original de CJ
      
      this.logger.log('💰 Prix calculés:', {
        originalPrice,
        sellingPrice
      });
      
      // ✅ SAUVEGARDER SEULEMENT LA CATÉGORIE EXTERNE (comme les produits statiques)
      this.logger.log('🔍 Catégorie externe CJ:', (cjProduct as any).categoryName);
      
      this.logger.log('💾 Sauvegarde dans la base de données...');
      
      // ✅ NOUVELLE APPROCHE ANTI-DOUBLONS : Vérifier d'abord les doublons
      this.logger.log('🔍 Vérification des doublons...');
      const isDuplicateStore = await this.duplicateService.checkCJStoreDuplicate(pid);
      
      if (isDuplicateStore) {
        this.logger.log(`⚠️ Produit ${pid} déjà dans le magasin CJ - Mise à jour au lieu de création`);
      }
      
      // ✅ UTILISER UPSERT INTELLIGENT pour le magasin CJ
      // 🧹 NETTOYAGE AUTOMATIQUE (Niveau 1)
      const cleanedName = this.cleanProductName((cjProduct as any).productNameEn || (cjProduct as any).productName);
      const cleanedDescription = this.cleanProductDescription((cjProduct as any).description);
      
      const storeProductData = {
        cjProductId: pid,
        name: cleanedName,
        description: cleanedDescription,
        price: sellingPrice,
        originalPrice: originalPrice,
        image: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage[0] : (cjProduct as any).productImage,
        category: (cjProduct as any).categoryName,
        status: 'available',
        isFavorite: isFavorite,
        // 🔧 AJOUTER TOUTES LES DONNÉES DÉTAILLÉES
        productSku: (cjProduct as any).productSku,
        productWeight: (cjProduct as any).productWeight,
        packingWeight: (cjProduct as any).packingWeight,
        productType: (cjProduct as any).productType,
        productUnit: (cjProduct as any).productUnit,
        productKeyEn: (cjProduct as any).productKeyEn,
        materialNameEn: (cjProduct as any).materialNameEn,
        packingNameEn: (cjProduct as any).packingNameEn,
        suggestSellPrice: (cjProduct as any).suggestSellPrice,
        listedNum: (cjProduct as any).listedNum,
        supplierName: (cjProduct as any).supplierName,
        createrTime: (cjProduct as any).createrTime,
        variants: JSON.stringify((cjProduct as any).variants || []),
        reviews: JSON.stringify((cjProduct as any).reviews || []),
        dimensions: (cjProduct as any).dimensions,
        brand: (cjProduct as any).brand,
        tags: JSON.stringify((cjProduct as any).tags || []),
      };
      
      const storeResult = await this.duplicateService.upsertCJStoreProduct(storeProductData);
      
      this.logger.log(`✅ Produit ${storeResult.isNew ? 'ajouté' : 'mis à jour'} dans le magasin CJ:`, {
        id: storeResult.productId,
        name: storeProductData.name,
        isFavorite: storeProductData.isFavorite,
        status: storeProductData.status,
        action: storeResult.isNew ? 'NOUVEAU' : 'MISE_À_JOUR'
      });
      this.logger.log('🎉 Import terminé avec succès');
      this.logger.log('🔍 === FIN IMPORT PRODUIT CJ ===');
      
      return {
        success: true,
        message: storeResult.isNew ? 'Produit ajouté au magasin CJ' : 'Produit mis à jour dans le magasin CJ',
        product: storeResult.productId,
        action: storeResult.isNew ? 'CREATED' : 'UPDATED',
        isDuplicate: !storeResult.isNew
      };
    } catch (error) {
      this.logger.error('❌ === ERREUR IMPORT PRODUIT ===');
      this.logger.error(`💥 Erreur import produit ${pid}: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR IMPORT PRODUIT ===');
      
      // ✅ Gérer spécifiquement le cas où le produit a été retiré des étagères
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('removed from shelves')) {
        return {
          success: false,
          message: `Ce produit a été retiré des étagères de CJ Dropshipping (PID: ${pid}). Il n'est plus disponible à l'import.`,
          product: null,
          errorCode: 'PRODUCT_REMOVED'
        };
      }
      
      // ✅ Retourner une erreur gracieuse au lieu de lancer une exception
      return {
        success: false,
        message: errorMessage || 'Erreur lors de l\'import du produit',
        product: null
      };
    }
  }

  /**
   * Fonction pour nettoyer le HTML de la description
   */
  private cleanDescription(htmlDescription: string): string {
    if (!htmlDescription) return 'N/A';
    
    // Supprimer les balises HTML
    let cleaned = htmlDescription
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim(); // Supprimer les espaces en début/fin
    
    // Limiter à 200 caractères pour l'affichage
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 200) + '...';
    }
    
    return cleaned;
  }

  /**
   * Nettoyer le nom d'un produit (Niveau 1 - Automatique)
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
   * Nettoyer la description d'un produit (Niveau 1 - Automatique)
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
}

