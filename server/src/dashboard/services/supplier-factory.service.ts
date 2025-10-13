import { Injectable } from '@nestjs/common';
import { CategoryData, ProductData, SupplierResponse, UserData } from '../interfaces/supplier.interface';
import { GenericSupplierService } from './generic-supplier.service';

@Injectable()
export class SupplierFactoryService {
  constructor(private readonly genericSupplierService: GenericSupplierService) {}

  /**
   * Récupère les produits d'un fournisseur spécifique
   */
  async getProducts(supplierName: string, options?: { limit?: number; skip?: number; category?: string }): Promise<SupplierResponse<ProductData[]>> {
    // Logique spécifique par fournisseur si nécessaire
    switch (supplierName) {
      case 'dummy-json':
        return this.getDummyJsonProducts(options);
      case 'fake-store':
        return this.getFakeStoreProducts(options);
      default:
        return this.genericSupplierService.getProducts(supplierName, options);
    }
  }

  /**
   * Récupère les utilisateurs d'un fournisseur spécifique
   */
  async getUsers(supplierName: string, options?: { limit?: number; skip?: number }): Promise<SupplierResponse<UserData[]>> {
    // Logique spécifique par fournisseur si nécessaire
    switch (supplierName) {
      case 'dummy-json':
        return this.getDummyJsonUsers(options);
      case 'fake-store':
        return this.getFakeStoreUsers(options);
      default:
        return this.genericSupplierService.getUsers(supplierName, options);
    }
  }

  /**
   * Récupère les catégories d'un fournisseur spécifique
   */
  async getCategories(supplierName: string): Promise<SupplierResponse<CategoryData[]>> {
    // Logique spécifique par fournisseur si nécessaire
    switch (supplierName) {
      case 'dummy-json':
        return this.getDummyJsonCategories();
      case 'fake-store':
        return this.getFakeStoreCategories();
      default:
        return this.genericSupplierService.getCategories(supplierName);
    }
  }

  /**
   * Teste la connexion à un fournisseur spécifique
   */
  async testConnection(supplierName: string): Promise<SupplierResponse<{ status: string; responseTime: number }>> {
    return this.genericSupplierService.testConnection(supplierName);
  }

  /**
   * Récupère les statistiques d'un fournisseur spécifique
   */
  async getStats(supplierName: string): Promise<SupplierResponse<{ products: number; users: number; categories: number }>> {
    return this.genericSupplierService.getSupplierStats(supplierName);
  }

  // Méthodes spécifiques pour DummyJSON
  private async getDummyJsonProducts(options?: { limit?: number; skip?: number; category?: string }): Promise<SupplierResponse<ProductData[]>> {
    // Logique spécifique pour DummyJSON si nécessaire
    return this.genericSupplierService.getProducts('dummy-json', options);
  }

  private async getDummyJsonUsers(options?: { limit?: number; skip?: number }): Promise<SupplierResponse<UserData[]>> {
    // Logique spécifique pour DummyJSON si nécessaire
    return this.genericSupplierService.getUsers('dummy-json', options);
  }

  private async getDummyJsonCategories(): Promise<SupplierResponse<CategoryData[]>> {
    // Logique spécifique pour DummyJSON si nécessaire
    return this.genericSupplierService.getCategories('dummy-json');
  }

  // Méthodes spécifiques pour Fake Store
  private async getFakeStoreProducts(options?: { limit?: number; skip?: number; category?: string }): Promise<SupplierResponse<ProductData[]>> {
    // Logique spécifique pour Fake Store si nécessaire
    return this.genericSupplierService.getProducts('fake-store', options);
  }

  private async getFakeStoreUsers(options?: { limit?: number; skip?: number }): Promise<SupplierResponse<UserData[]>> {
    // Logique spécifique pour Fake Store si nécessaire
    return this.genericSupplierService.getUsers('fake-store', options);
  }

  private async getFakeStoreCategories(): Promise<SupplierResponse<CategoryData[]>> {
    // Logique spécifique pour Fake Store si nécessaire
    return this.genericSupplierService.getCategories('fake-store');
  }
}
