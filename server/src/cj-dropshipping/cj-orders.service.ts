import { Injectable, Logger } from '@nestjs/common';
import { CJAPIClient } from './cj-api-client';

@Injectable()
export class CJOrdersService {
  private readonly logger = new Logger(CJOrdersService.name);

  constructor() {
    this.logger.log('CJOrdersService initialisé');
  }

  /**
   * Crée une commande V2
   */
  async createOrderV2(orderData: {
    orderNumber: string;
    shippingZip?: string;
    shippingCountry: string;
    shippingCountryCode: string;
    shippingProvince: string;
    shippingCity: string;
    shippingCounty?: string;
    shippingPhone?: string;
    shippingCustomerName: string;
    shippingAddress: string;
    shippingAddress2?: string;
    taxId?: string;
    remark?: string;
    email?: string;
    consigneeID?: string;
    payType?: number;
    shopAmount?: string;
    logisticName: string;
    fromCountryCode: string;
    houseNumber?: string;
    iossType?: number;
    platform?: string;
    iossNumber?: string;
    products: Array<{
      vid?: string;
      sku?: string;
      quantity: number;
      unitPrice?: number;
      storeLineItemId?: string;
      podProperties?: string;
    }>;
  }): Promise<{ success: boolean; orderId: string; message: string; data?: any }> {
    this.logger.log(`🛒 Création commande V2: ${orderData.orderNumber}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/createOrderV2', orderData);
      
      if (result.code === 200) {
        this.logger.log(`✅ Commande V2 créée: ${result.data.orderId}`);
        return {
          success: true,
          orderId: result.data.orderId,
          message: 'Commande V2 créée avec succès',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la création de la commande V2');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur création commande V2: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crée une commande V3
   */
  async createOrderV3(orderData: {
    orderNumber: string;
    shippingZip?: string;
    shippingCountry: string;
    shippingCountryCode: string;
    shippingProvince: string;
    shippingCity: string;
    shippingCounty?: string;
    shippingPhone?: string;
    shippingCustomerName: string;
    shippingAddress: string;
    shippingAddress2?: string;
    taxId?: string;
    remark?: string;
    email?: string;
    consigneeID?: string;
    shopAmount?: string;
    logisticName: string;
    fromCountryCode: string;
    houseNumber?: string;
    iossType?: number;
    platform?: string;
    iossNumber?: string;
    products: Array<{
      vid?: string;
      sku?: string;
      quantity: number;
      unitPrice?: number;
      storeLineItemId?: string;
      podProperties?: string;
    }>;
  }): Promise<{ success: boolean; orderId: string; message: string; data?: any }> {
    this.logger.log(`🛒 Création commande V3: ${orderData.orderNumber}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/createOrderV3', orderData);
      
      if (result.code === 200) {
        this.logger.log(`✅ Commande V3 créée: ${result.data.orderId}`);
        return {
          success: true,
          orderId: result.data.orderId,
          message: 'Commande V3 créée avec succès',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la création de la commande V3');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur création commande V3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Ajoute des commandes au panier
   */
  async addToCart(cjOrderIdList: string[]): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.log(`🛒 Ajout au panier: ${cjOrderIdList.length} commandes`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/addCart', {
        cjOrderIdList
      });
      
      if (result.success) {
        this.logger.log(`✅ ${result.data.successCount} commandes ajoutées au panier`);
        return {
          success: true,
          message: `${result.data.successCount} commandes ajoutées au panier`,
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur ajout panier: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirme les commandes du panier
   */
  async confirmCart(cjOrderIdList: string[]): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.log(`✅ Confirmation panier: ${cjOrderIdList.length} commandes`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/addCartConfirm', {
        cjOrderIdList
      });
      
      if (result.success) {
        this.logger.log(`✅ ${result.data.successCount} commandes confirmées`);
        return {
          success: true,
          message: `${result.data.successCount} commandes confirmées`,
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la confirmation du panier');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur confirmation panier: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sauvegarde et génère une commande parent
   */
  async saveGenerateParentOrder(shipmentOrderId: string): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.log(`💾 Sauvegarde commande parent: ${shipmentOrderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/saveGenerateParentOrder', {
        shipmentOrderId
      });
      
      if (result.success) {
        this.logger.log(`✅ Commande parent sauvegardée: ${result.data.payId}`);
        return {
          success: true,
          message: 'Commande parent sauvegardée avec succès',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la sauvegarde de la commande parent');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur sauvegarde commande parent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère la liste des commandes
   */
  async getOrders(params: {
    pageNum?: number;
    pageSize?: number;
    orderIds?: string[];
    shipmentOrderId?: string;
    status?: string;
  } = {}): Promise<{ success: boolean; orders: any[]; total: number }> {
    this.logger.log('📋 Récupération des commandes...');
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/list', params, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ ${result.data.total} commandes trouvées`);
        return {
          success: true,
          orders: result.data.list || [],
          total: result.data.total || 0
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des commandes');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération commandes: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère les détails d'une commande
   */
  async getOrderDetails(orderId: string, features?: string[]): Promise<{ success: boolean; order: any }> {
    this.logger.log(`🔍 Récupération détails commande: ${orderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const params: any = { orderId };
      if (features && features.length > 0) {
        features.forEach(feature => {
          params.features = feature;
        });
      }
      
      const result = await client.makeRequest('/shopping/order/getOrderDetail', params, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ Détails commande récupérés: ${result.data.orderId}`);
        return {
          success: true,
          order: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des détails de la commande');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération détails commande: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Supprime une commande
   */
  async deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🗑️ Suppression commande: ${orderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/deleteOrder', { orderId }, 'DELETE');
      
      if (result.code === 200) {
        this.logger.log(`✅ Commande supprimée: ${result.data}`);
        return {
          success: true,
          message: 'Commande supprimée avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression de la commande');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur suppression commande: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirme une commande
   */
  async confirmOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`✅ Confirmation commande: ${orderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/order/confirmOrder', { orderId }, 'PATCH');
      
      if (result.code === 200) {
        this.logger.log(`✅ Commande confirmée: ${result.data}`);
        return {
          success: true,
          message: 'Commande confirmée avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la confirmation de la commande');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur confirmation commande: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère le solde du compte
   */
  async getBalance(): Promise<{ success: boolean; balance: any }> {
    this.logger.log('💰 Récupération du solde...');
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/pay/getBalance', {}, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ Solde récupéré: $${result.data.amount}`);
        return {
          success: true,
          balance: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération du solde');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération solde: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Paiement avec solde
   */
  async payWithBalance(orderId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`💳 Paiement avec solde: ${orderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/pay/payBalance', { orderId });
      
      if (result.code === 200) {
        this.logger.log(`✅ Paiement effectué: ${orderId}`);
        return {
          success: true,
          message: 'Paiement effectué avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur paiement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Paiement avec solde V2
   */
  async payWithBalanceV2(shipmentOrderId: string, payId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`💳 Paiement V2 avec solde: ${shipmentOrderId}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/shopping/pay/payBalanceV2', {
        shipmentOrderId,
        payId
      });
      
      if (result.code === 200) {
        this.logger.log(`✅ Paiement V2 effectué: ${shipmentOrderId}`);
        return {
          success: true,
          message: 'Paiement V2 effectué avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors du paiement V2');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur paiement V2: ${error.message}`, error.stack);
      throw error;
    }
  }
}
