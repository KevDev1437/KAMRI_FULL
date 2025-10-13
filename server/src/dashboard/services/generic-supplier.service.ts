import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as suppliersConfig from '../config/suppliers.json';
import { CategoryData, ProductData, SupplierConfig, SupplierResponse, UserData } from '../interfaces/supplier.interface';

@Injectable()
export class GenericSupplierService {
  private readonly logger = new Logger(GenericSupplierService.name);
  private readonly suppliers: Record<string, SupplierConfig> = suppliersConfig as Record<string, SupplierConfig>;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Récupère la configuration d'un fournisseur
   */
  getSupplierConfig(supplierName: string): SupplierConfig {
    const config = this.suppliers[supplierName];
    if (!config) {
      throw new Error(`Fournisseur "${supplierName}" non trouvé`);
    }
    return config;
  }

  /**
   * Récupère les produits d'un fournisseur
   */
  async getProducts(supplierName: string, options?: { limit?: number; skip?: number; category?: string }): Promise<SupplierResponse<ProductData[]>> {
    try {
      const config = this.getSupplierConfig(supplierName);
      let url = `${config.baseUrl}${config.endpoints.products}`;
      
      // Ajouter les paramètres de requête
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.skip) params.append('skip', options.skip.toString());
      if (options?.category) params.append('category', options.category);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      this.logger.log(`Récupération des produits de ${supplierName}: ${url}`);
      
      const response = await firstValueFrom(this.httpService.get(url));
      
      return {
        success: true,
        data: response.data.products || response.data,
        metadata: {
          total: response.data.total,
          page: response.data.skip ? Math.floor(response.data.skip / (options?.limit || 30)) + 1 : 1,
          limit: options?.limit || 30
        }
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des produits de ${supplierName}:`, error);
      return {
        success: false,
        data: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Récupère un produit spécifique par ID
   */
  async getProduct(supplierName: string, productId: string | number): Promise<SupplierResponse<ProductData>> {
    try {
      const config = this.getSupplierConfig(supplierName);
      const url = `${config.baseUrl}${config.endpoints.products}/${productId}`;
      
      this.logger.log(`Récupération du produit ${productId} de ${supplierName}: ${url}`);
      
      const response = await firstValueFrom(this.httpService.get(url));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du produit ${productId} de ${supplierName}:`, error);
      return {
        success: false,
        data: null,
        error: (error as Error).message
      };
    }
  }

  /**
   * Récupère les utilisateurs d'un fournisseur
   */
  async getUsers(supplierName: string, options?: { limit?: number; skip?: number }): Promise<SupplierResponse<UserData[]>> {
    try {
      const config = this.getSupplierConfig(supplierName);
      let url = `${config.baseUrl}${config.endpoints.users}`;
      
      // Ajouter les paramètres de requête
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.skip) params.append('skip', options.skip.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      this.logger.log(`Récupération des utilisateurs de ${supplierName}: ${url}`);
      
      const response = await firstValueFrom(this.httpService.get(url));
      
      return {
        success: true,
        data: response.data.users || response.data,
        metadata: {
          total: response.data.total,
          page: response.data.skip ? Math.floor(response.data.skip / (options?.limit || 30)) + 1 : 1,
          limit: options?.limit || 30
        }
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des utilisateurs de ${supplierName}:`, error);
      return {
        success: false,
        data: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Récupère les catégories d'un fournisseur
   */
  async getCategories(supplierName: string): Promise<SupplierResponse<CategoryData[]>> {
    try {
      const config = this.getSupplierConfig(supplierName);
      const url = `${config.baseUrl}${config.endpoints.categories}`;
      
      this.logger.log(`Récupération des catégories de ${supplierName}: ${url}`);
      
      const response = await firstValueFrom(this.httpService.get(url));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des catégories de ${supplierName}:`, error);
      return {
        success: false,
        data: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Teste la connexion à un fournisseur
   */
  async testConnection(supplierName: string): Promise<SupplierResponse<{ status: string; responseTime: number }>> {
    const startTime = Date.now();
    
    try {
      const config = this.getSupplierConfig(supplierName);
      const url = `${config.baseUrl}${config.endpoints.products}?limit=1`;
      
      this.logger.log(`Test de connexion à ${supplierName}: ${url}`);
      
      const response = await firstValueFrom(this.httpService.get(url));
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          status: 'connected',
          responseTime
        }
      };
    } catch (error) {
      this.logger.error(`Erreur de connexion à ${supplierName}:`, error);
      return {
        success: false,
        data: {
          status: 'error',
          responseTime: Date.now() - startTime
        },
        error: (error as Error).message
      };
    }
  }

  /**
   * Liste tous les fournisseurs disponibles
   */
  getAvailableSuppliers(): string[] {
    return Object.keys(this.suppliers);
  }

  /**
   * Récupère les statistiques d'un fournisseur
   */
  async getSupplierStats(supplierName: string): Promise<SupplierResponse<{ products: number; users: number; categories: number }>> {
    try {
      const [productsResponse, usersResponse, categoriesResponse] = await Promise.all([
        this.getProducts(supplierName, { limit: 1 }),
        this.getUsers(supplierName, { limit: 1 }),
        this.getCategories(supplierName)
      ]);

      return {
        success: true,
        data: {
          products: productsResponse.metadata?.total || 0,
          users: usersResponse.metadata?.total || 0,
          categories: categoriesResponse.data?.length || 0
        }
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques de ${supplierName}:`, error);
      return {
        success: false,
        data: { products: 0, users: 0, categories: 0 },
        error: (error as Error).message
      };
    }
  }
}
