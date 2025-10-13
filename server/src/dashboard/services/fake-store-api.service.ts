import { Injectable } from '@nestjs/common';

export interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface FakeStoreCategory {
  name: string;
}

@Injectable()
export class FakeStoreApiService {
  private readonly baseUrl = 'https://fakestoreapi.com';

  async getAllProducts(): Promise<FakeStoreProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products from Fake Store API:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<FakeStoreProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id} from Fake Store API:`, error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories from Fake Store API:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<FakeStoreProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products/category/${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/products?limit=1`);
      if (response.ok) {
        return { success: true, message: 'Fake Store API connection successful' };
      } else {
        return { success: false, message: `Connection failed: ${response.status}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}
