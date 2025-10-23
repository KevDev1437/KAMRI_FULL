import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';

@Injectable()
export class CJCategoriesService {
  private readonly logger = new Logger(CJCategoriesService.name);

  constructor(
    private prisma: PrismaService
  ) {}

  /**
   * Récupérer toutes les catégories depuis l'API CJ
   */
  async getAllCategories(): Promise<any[]> {
    this.logger.log('🏷️ === RÉCUPÉRATION DES CATÉGORIES CJ ===');
    
    try {
      const client = await this.initializeClient();
      const categories = await client.getCategories();
      
      this.logger.log(`✅ ${categories.length} catégories récupérées`);
      
      // Sauvegarder en base de données
      await this.saveCategoriesToDatabase(categories);
      
      return categories;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'arbre des catégories
   */
  async getCategoriesTree(): Promise<any[]> {
    this.logger.log('🌳 === RÉCUPÉRATION DE L\'ARBRE DES CATÉGORIES ===');
    
    try {
      const client = await this.initializeClient();
      const tree = await client.getCategoriesTree();
      
      this.logger.log(`✅ Arbre des catégories récupéré`);
      
      return tree;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération de l\'arbre:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder les catégories en base de données
   */
  private async saveCategoriesToDatabase(categories: any[]): Promise<void> {
    this.logger.log('💾 Sauvegarde des catégories en base de données...');
    
    try {
      for (const category of categories) {
        await this.prisma.category.upsert({
          where: { 
            id: category.id.toString() 
          },
          update: {
            name: category.name,
            nameEn: category.nameEn,
            parentId: category.parentId?.toString(),
            level: category.level,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            externalId: category.id.toString(),
            name: category.name,
            nameEn: category.nameEn,
            parentId: category.parentId?.toString(),
            level: category.level,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      
      this.logger.log(`✅ ${categories.length} catégories sauvegardées`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  /**
   * Initialiser le client CJ
   */
  private async initializeClient(): Promise<CJAPIClient> {
    this.logger.log('🚀 Initialisation du client CJ...');
    
    const config = await this.getConfig();
    if (!config.enabled) {
      throw new Error('L\'intégration CJ Dropshipping est désactivée');
    }

    const cjApiClient = new CJAPIClient(null as any);
    cjApiClient.setConfig({
      email: config.email,
      apiKey: config.apiKey,
      tier: config.tier as 'free' | 'plus' | 'prime' | 'advanced',
      platformToken: config.platformToken,
      debug: process.env.CJ_DEBUG === 'true',
    });

    await cjApiClient.login();
    this.logger.log('✅ Client CJ initialisé avec succès');
    
    return cjApiClient;
  }

  /**
   * Obtenir la configuration CJ
   */
  private async getConfig(): Promise<any> {
    // Configuration temporaire pour les tests
    return {
      enabled: true,
      email: 'test@example.com',
      apiKey: 'test-api-key',
      tier: 'free',
      platformToken: 'test-token'
    };
  }
}
