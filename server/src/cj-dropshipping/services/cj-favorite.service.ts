import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DuplicatePreventionService } from '../../common/services/duplicate-prevention.service';
import { CJAPIClient } from '../cj-api-client';
import { CJSyncProgressEvent, CJSyncResult } from '../interfaces/cj-sync-progress.interface';

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
   * Récupère la liste de mes produits (favoris CJ) avec pagination complète
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
    this.logger.log('📦 === DÉBUT RÉCUPÉRATION FAVORIS CJ (AVEC PAGINATION) ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(params, null, 2));
    
    try {
      const client = await this.initializeClient();
      this.logger.log('🔗 Client CJ initialisé, appel API avec pagination complète...');
      
      // ✅ Récupération de TOUS les favoris (toutes les pages)
      this.logger.log('📡 Récupération de tous les favoris CJ (toutes les pages)...');
      const myProducts = await client.getMyProducts({
        keyword: params.keyword,
        categoryId: params.categoryId,
        startAt: params.startAt,
        endAt: params.endAt,
        isListed: params.isListed,
        visiable: params.visiable,
        hasPacked: params.hasPacked,
        hasVirPacked: params.hasVirPacked,
        pageSize: 100 // Max par page
      });
      
      if (!myProducts || myProducts.length === 0) {
        this.logger.log('ℹ️ Aucun favori trouvé');
        return {
          success: true,
          products: [],
          total: 0
        };
      }
      
      this.logger.log(`📦 ${myProducts.length} favoris récupérés depuis CJ (toutes les pages)`);
      
      // Transformer les données selon la structure CJ (myProduct/query API)
      const transformedProducts = myProducts.map((product: any) => {
        return {
          pid: product.productId,
          productId: product.productId, // ✅ Garder productId pour dédoublonnage
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
          // Informations supplémentaires
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
      
      this.logger.log(`✅ ${transformedProducts.length} favoris transformés`);
      
      return {
        success: true,
        products: transformedProducts,
        total: transformedProducts.length
      };
    } catch (error) {
      this.logger.error('❌ === ERREUR RÉCUPÉRATION FAVORIS ===');
      this.logger.error(`💥 Erreur: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR RÉCUPÉRATION FAVORIS ===');
      throw error;
    }
  }

  /**
   * Synchroniser les favoris CJ avec KAMRI (avec pagination complète)
   */
  async syncFavorites(): Promise<{ success: boolean; synced: number; failed: number; total: number; errors: Array<{ pid: string; name: string; error: string }>; message: string }> {
    this.logger.log('🔄 === DÉBUT SYNCHRONISATION FAVORIS CJ (AVEC PAGINATION) ===');
    
    try {
      // Initialisation du client
      const client = await this.initializeClient();
      
      // ✅ Récupération de TOUS les favoris (toutes les pages)
      this.logger.log('📡 Récupération de tous les favoris CJ...');
      const myProducts = await client.getMyProducts({
        pageSize: 100 // Max par page
      });
      
      if (!myProducts || myProducts.length === 0) {
        return {
          success: true,
          synced: 0,
          failed: 0,
          total: 0,
          errors: [],
          message: 'Aucun favori trouvé sur CJ'
        };
      }
      
      this.logger.log(`📦 ${myProducts.length} favoris récupérés depuis CJ`);
      
      // Dédoublonnage par productId (au lieu de pid)
      const uniqueProducts = Array.from(
        new Map(myProducts.map(p => [p.productId || p.pid, p])).values()
      );
      
      this.logger.log(`🔍 ${uniqueProducts.length} favoris uniques après dédoublonnage`);
      
      // Import avec progression
      const total = uniqueProducts.length;
      let synced = 0;
      let failed = 0;
      const errors: Array<{ pid: string; name: string; error: string }> = [];
      
      // Obtenir le tier pour le délai
      const config = await this.prisma.cJConfig.findFirst();
      const tier = config?.tier || 'free';
      const delay = this.getTierDelay(tier);
      
      for (let i = 0; i < uniqueProducts.length; i++) {
        const product = uniqueProducts[i];
        const pid = product.productId || product.pid;
        const progress = Math.round(((i + 1) / total) * 100);
        
        this.logger.log(`🔄 [${i + 1}/${total}] (${progress}%) - Import ${product.nameEn || product.productNameEn || pid}...`);
        
        try {
          await this.importProduct(pid, undefined, 0, true);
          synced++;
          this.logger.log(`✅ [${i + 1}/${total}] Import réussi`);
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({
            pid: pid,
            name: product.nameEn || product.productNameEn || pid,
            error: errorMessage
          });
          this.logger.error(`❌ [${i + 1}/${total}] Échec: ${errorMessage}`);
        }
        
        // Rate limiting adapté selon le tier
        if (i < uniqueProducts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      this.logger.log('🎉 === FIN SYNCHRONISATION FAVORIS CJ ===');
      this.logger.log(`📊 Résultat final : ${synced} réussis, ${failed} échecs sur ${total} total`);
      
      if (errors.length > 0) {
        this.logger.error(`❌ ${errors.length} erreurs détaillées:`, JSON.stringify(errors, null, 2));
      }
      
      return {
        success: failed === 0,
        synced,
        failed,
        total,
        errors,
        message: `${synced}/${total} favoris synchronisés${failed > 0 ? ` (${failed} échecs)` : ''}`
      };
      
    } catch (error) {
      this.logger.error('❌ Erreur synchronisation favoris:', error);
      throw error;
    }
  }

  /**
   * Helper pour obtenir le délai selon le tier
   */
  private getTierDelay(tier: string): number {
    const delays: { [key: string]: number } = {
      'advanced': 500,   // 0.5s
      'prime': 1000,     // 1s
      'plus': 1500,      // 1.5s
      'free': 3000       // 3s
    };
    
    return delays[tier] || 3000;
  }

  /**
   * Synchroniser les favoris CJ avec callback de progression
   * @param onProgress Fonction callback pour envoyer la progression
   */
  async syncFavoritesWithProgress(
    onProgress: (event: CJSyncProgressEvent) => void
  ): Promise<CJSyncResult> {
    this.logger.log('🔄 === DÉBUT SYNCHRONISATION FAVORIS CJ (AVEC PROGRESSION) ===');
    
    const startTime = Date.now();
    
    try {
      // ===== ÉTAPE 1 : RÉCUPÉRATION =====
      onProgress({
        stage: 'fetching',
        current: 0,
        total: 0,
        percentage: 0,
        productName: 'Récupération de vos favoris CJ...',
        synced: 0,
        failed: 0,
        estimatedTimeRemaining: 0,
        speed: 0
      });
      
      // Initialisation du client
      const client = await this.initializeClient();
      
      // Récupération de TOUS les favoris (toutes les pages)
      this.logger.log('📡 Récupération de tous les favoris CJ...');
      const myProducts = await client.getMyProducts({
        pageSize: 100
      });
      
      if (!myProducts || myProducts.length === 0) {
        const result: CJSyncResult = {
          done: true,
          success: false,
          synced: 0,
          failed: 0,
          total: 0,
          duration: (Date.now() - startTime) / 1000,
          message: 'Aucun favori trouvé sur CJ'
        };
        return result;
      }
      
      this.logger.log(`📦 ${myProducts.length} favoris récupérés depuis CJ`);
      
      // Dédoublonnage
      const uniqueProducts = Array.from(
        new Map(myProducts.map(p => [p.productId || p.pid, p])).values()
      );
      
      this.logger.log(`🔍 ${uniqueProducts.length} favoris uniques après dédoublonnage`);
      
      // ===== ÉTAPE 2 : IMPORT =====
      const total = uniqueProducts.length;
      let synced = 0;
      let failed = 0;
      const errors: Array<{ pid: string; name: string; error: string }> = [];
      
      // Obtenir le tier pour le délai
      const config = await this.prisma.cJConfig.findFirst();
      const tier = config?.tier || 'free';
      const delay = this.getTierDelay(tier);
      
      // Import avec progression
      for (let i = 0; i < uniqueProducts.length; i++) {
        const product = uniqueProducts[i];
        const pid = product.productId || product.pid;
        const productName = product.nameEn || product.productNameEn || pid;
        
        // Calcul du temps écoulé et estimation
        const elapsed = Date.now() - startTime;
        const avgTimePerProduct = elapsed / (i + 1);
        const remainingProducts = total - i - 1;
        const estimatedTimeRemaining = Math.round((remainingProducts * avgTimePerProduct) / 1000);
        const speed = (i + 1) / (elapsed / 1000); // produits par seconde
        const percentage = Math.round(((i + 1) / total) * 100);
        
        // Envoyer la progression AVANT l'import
        onProgress({
          stage: 'importing',
          current: i + 1,
          total: total,
          percentage: percentage,
          productName: productName,
          synced: synced,
          failed: failed,
          estimatedTimeRemaining: estimatedTimeRemaining,
          speed: parseFloat(speed.toFixed(2))
        });
        
        this.logger.log(`🔄 [${i + 1}/${total}] (${percentage}%) - Import ${productName}...`);
        
        // Import du produit
        try {
          await this.importProduct(pid, undefined, 0, true);
          synced++;
          this.logger.log(`✅ [${i + 1}/${total}] Import réussi`);
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({
            pid: pid,
            name: productName,
            error: errorMessage
          });
          this.logger.error(`❌ [${i + 1}/${total}] Échec: ${errorMessage}`);
        }
        
        // Rate limiting (sauf pour le dernier)
        if (i < uniqueProducts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // ===== RÉSULTAT FINAL =====
      const duration = (Date.now() - startTime) / 1000;
      
      this.logger.log('🎉 === FIN SYNCHRONISATION FAVORIS CJ ===');
      this.logger.log(`📊 Résultat final : ${synced} réussis, ${failed} échecs sur ${total} total`);
      this.logger.log(`⏱️ Durée totale : ${Math.round(duration)}s`);
      
      if (errors.length > 0) {
        this.logger.error(`❌ ${errors.length} erreurs détaillées:`, JSON.stringify(errors, null, 2));
      }
      
      const result: CJSyncResult = {
        done: true,
        success: failed === 0,
        synced,
        failed,
        total,
        duration: Math.round(duration),
        errors: errors.length > 0 ? errors : undefined,
        message: `${synced}/${total} favoris synchronisés${failed > 0 ? ` (${failed} échecs)` : ''} en ${Math.round(duration)}s`
      };
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Erreur synchronisation favoris:', error);
      
      const duration = (Date.now() - startTime) / 1000;
      const result: CJSyncResult = {
        done: true,
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        duration: Math.round(duration),
        message: `Erreur de synchronisation: ${error instanceof Error ? error.message : String(error)}`
      };
      
      return result;
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

