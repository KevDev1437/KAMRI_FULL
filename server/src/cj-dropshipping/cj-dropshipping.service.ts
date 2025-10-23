import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';

@Injectable()
export class CJDropshippingService {
  private readonly logger = new Logger(CJDropshippingService.name);
  private readonly cjApiClient: CJAPIClient;

  constructor(private prisma: PrismaService) {
    this.cjApiClient = new CJAPIClient();
  }

  async getCJCategories() {
    try {
      this.logger.log('🔍 Récupération des catégories CJ...');
      const categories = await this.cjApiClient.getCategories();
      
      this.logger.log(`✅ ${categories.length} catégories récupérées`);
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      this.logger.error('❌ Erreur récupération catégories CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async searchCJProducts(searchParams: any) {
    try {
      this.logger.log('🔍 Recherche produits CJ avec paramètres:', searchParams);
      
      // Vérifier que la clé API est configurée
      if (!process.env.CJ_API_KEY || process.env.CJ_API_KEY === 'your_cj_api_key_here') {
        this.logger.error('❌ Clé API CJ non configurée');
        return {
          success: false,
          error: 'Clé API CJ non configurée. Veuillez configurer CJ_API_KEY dans les variables d\'environnement.'
        };
      }

      // Convertir les paramètres vers le format CJ
      const cjParams = {
        productName: searchParams.productName,
        categoryId: searchParams.categoryId,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        pageNum: searchParams.pageNum || 1,
        pageSize: searchParams.pageSize || 50,
        countryCode: searchParams.countryCode,
        startInventory: searchParams.startInventory,
        deliveryTime: searchParams.deliveryTime,
        isFreeShipping: searchParams.isFreeShipping,
        productType: searchParams.productType,
        sort: searchParams.sort,
        orderBy: searchParams.orderBy
      };

      this.logger.log('🔗 Tentative de connexion à l\'API CJ...');
      const products = await this.cjApiClient.searchProducts(cjParams);
      
      this.logger.log(`✅ ${products.list?.length || 0} produits trouvés`);
      return {
        success: true,
        data: products
      };
    } catch (error) {
      this.logger.error('❌ Erreur recherche produits CJ:', error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        if (error.message.includes('ENOTFOUND')) {
          errorMessage = 'Impossible de se connecter à l\'API CJ Dropshipping. Vérifiez votre connexion internet.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Clé API CJ invalide. Vérifiez votre configuration.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Accès refusé à l\'API CJ. Vérifiez vos permissions.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getCJProductDetails(pid: string) {
    try {
      this.logger.log(`🔍 Récupération détails produit CJ: ${pid}`);
      const product = await this.cjApiClient.getProductDetails(pid);
      
      this.logger.log(`✅ Détails produit ${pid} récupérés`);
      return {
        success: true,
        data: product
      };
    } catch (error) {
      this.logger.error(`❌ Erreur détails produit CJ ${pid}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async importCJProduct(importData: any) {
    try {
      this.logger.log('📥 Import produit CJ:', importData);
      
      // Vérifier si le produit existe déjà
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          cjMapping: {
            cjProductId: importData.pid
          }
        }
      });

      if (existingProduct) {
        this.logger.warn(`⚠️ Produit ${importData.pid} déjà importé`);
        return {
          success: false,
          error: 'Produit déjà importé'
        };
      }

      // Récupérer les détails du produit depuis CJ
      const cjProduct = await this.cjApiClient.getProductDetails(importData.pid);
      
      if (!cjProduct) {
        return {
          success: false,
          error: 'Produit non trouvé sur CJ'
        };
      }

      // Créer le produit dans la base locale
      const product = await this.prisma.product.create({
        data: {
          name: cjProduct.productNameEn || cjProduct.productName,
          description: cjProduct.productDescriptionEn || cjProduct.productDescription || '',
          price: parseFloat(cjProduct.sellPrice),
          originalPrice: cjProduct.originalPrice ? parseFloat(cjProduct.originalPrice) : null,
          image: cjProduct.productImage,
          categoryId: importData.categoryId || null,
          supplierId: importData.supplierId || null,
          source: 'cj-dropshipping',
          status: 'draft',
          stock: 0,
          sales: 0,
          cjMapping: {
            create: {
              cjProductId: importData.pid,
              cjSku: cjProduct.productSku,
              lastSyncAt: new Date()
            }
          }
        },
        include: {
          cjMapping: true
        }
      });

      this.logger.log(`✅ Produit ${importData.pid} importé avec succès`);
      return {
        success: true,
        data: product
      };
    } catch (error) {
      this.logger.error('❌ Erreur import produit CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async getCJProductStock(pid: string, countryCode: string = 'US') {
    try {
      this.logger.log(`📊 Récupération stock produit CJ ${pid} pour ${countryCode}`);
      const stock = await this.cjApiClient.getProductStock(pid, countryCode);
      
      return {
        success: true,
        data: stock
      };
    } catch (error) {
      this.logger.error(`❌ Erreur stock produit CJ ${pid}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async getCJConfig() {
    try {
      // Récupérer la configuration depuis la base de données
      const config = await this.prisma.cJConfig.findFirst();
      
      if (config) {
        return {
          success: true,
          data: {
            id: config.id,
            email: config.email,
            apiKey: config.apiKey ? '***' + config.apiKey.slice(-4) : 'not configured',
            tier: config.tier,
            platformToken: config.platformToken,
            enabled: config.enabled,
            connected: !!config.apiKey,
            lastSync: config.updatedAt,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
          }
        };
      } else {
        // Aucune configuration trouvée
        return {
          success: true,
          data: {
            id: null,
            email: 'Non configuré',
            apiKey: 'not configured',
            tier: 'unconfigured',
            platformToken: null,
            enabled: false,
            connected: false,
            lastSync: null,
            createdAt: null,
            updatedAt: null
          }
        };
      }
    } catch (error) {
      this.logger.error('❌ Erreur config CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async updateCJConfig(configData: any) {
    try {
      this.logger.log('🔧 Mise à jour configuration CJ:', configData);
      
      // Vérifier si une configuration existe déjà
      const existingConfig = await this.prisma.cJConfig.findFirst();
      
      let config;
      if (existingConfig) {
        // Mettre à jour la configuration existante
        config = await this.prisma.cJConfig.update({
          where: { id: existingConfig.id },
          data: {
            email: configData.email || existingConfig.email,
            apiKey: configData.apiKey || existingConfig.apiKey,
            tier: configData.tier || existingConfig.tier,
            platformToken: configData.platformToken || existingConfig.platformToken,
            enabled: configData.enabled !== undefined ? configData.enabled : existingConfig.enabled,
            updatedAt: new Date()
          }
        });
      } else {
        // Créer une nouvelle configuration
        config = await this.prisma.cJConfig.create({
          data: {
            email: configData.email || '',
            apiKey: configData.apiKey || '',
            tier: configData.tier || 'free',
            platformToken: configData.platformToken || null,
            enabled: configData.enabled !== undefined ? configData.enabled : true
          }
        });
      }
      
      this.logger.log('✅ Configuration CJ sauvegardée:', config);
      
      return {
        success: true,
        message: 'Configuration CJ mise à jour avec succès',
        data: {
          id: config.id,
          email: config.email,
          apiKey: config.apiKey ? '***' + config.apiKey.slice(-4) : 'not configured',
          tier: config.tier,
          platformToken: config.platformToken,
          enabled: config.enabled,
          connected: !!config.apiKey,
          lastSync: config.updatedAt,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        }
      };
    } catch (error) {
      this.logger.error('❌ Erreur mise à jour config CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async getCJStats() {
    try {
      this.logger.log('📊 Récupération statistiques CJ...');
      
      // Compter les produits CJ dans la base locale
      const productCount = await this.prisma.product.count({
        where: { source: 'cj-dropshipping' }
      });

      // Compter les commandes CJ (si vous avez une table orders avec source)
      const orderCount = await this.prisma.order.count({
        where: {
          items: {
            some: {
              product: {
                source: 'cj-dropshipping'
              }
            }
          }
        }
      });

      // Vérifier le statut de connexion en testant réellement l'API
      let isConnected = false;
      try {
        this.logger.log('🔍 [CJ-STATS] Début du test de connexion...');
        this.logger.log(`🔑 [CJ-STATS] Clé API utilisée: ${process.env.CJ_API_KEY ? process.env.CJ_API_KEY.substring(0, 8) + '...' : 'NON CONFIGURÉE'}`);
        this.logger.log(`🌐 [CJ-STATS] URL de base: ${process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1'}`);
        
        // Test rapide de l'API pour vérifier la validité de la clé
        const testResult = await this.cjApiClient.testConnection();
        this.logger.log(`✅ [CJ-STATS] Résultat du test: ${testResult}`);
        isConnected = testResult;
      } catch (error) {
        this.logger.log('❌ [CJ-STATS] Test connexion échoué:', error instanceof Error ? error.message : 'Erreur inconnue');
        this.logger.log('❌ [CJ-STATS] Détails de l\'erreur:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        isConnected = false;
      }
      
      this.logger.log(`🔑 [CJ-STATS] API Key configurée: ${!!process.env.CJ_API_KEY}`);
      this.logger.log(`🔗 [CJ-STATS] Statut connexion: ${isConnected ? 'connecté' : 'déconnecté'}`);
      this.logger.log(`📊 [CJ-STATS] Produits CJ: ${productCount}, Commandes CJ: ${orderCount}`);
      
      return {
        success: true,
        data: {
          status: isConnected ? 'connected' : 'disconnected',
          tier: isConnected ? 'configured' : 'unconfigured',
          products: {
            total: productCount,
            synced: productCount // Pour l'instant, tous les produits sont considérés comme synchronisés
          },
          orders: {
            total: orderCount,
            active: orderCount // Pour l'instant, toutes les commandes sont considérées comme actives
          },
          webhooks: {
            total: 0,
            recent: 0,
            processed: 0
          },
          lastSync: new Date().toISOString(),
          apiKey: process.env.CJ_API_KEY ? '***configured***' : null,
          baseUrl: process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1'
        }
      };
    } catch (error) {
      this.logger.error('❌ Erreur statistiques CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async testCJConnection() {
    try {
      this.logger.log('🔗 Test connexion CJ Dropshipping...');
      const testResult = await this.cjApiClient.testConnection();
      
      return {
        success: testResult,
        message: testResult ? 'Connexion CJ réussie' : 'Connexion CJ échouée'
      };
    } catch (error) {
      this.logger.error('❌ Erreur test connexion CJ:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}