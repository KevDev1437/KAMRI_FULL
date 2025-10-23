import { Injectable, Logger } from '@nestjs/common';
import { CJAPIClient } from './cj-api-client';

@Injectable()
export class CJDisputesService {
  private readonly logger = new Logger(CJDisputesService.name);

  /**
   * Récupère la liste des produits en litige
   */
  async getDisputeProducts(orderId: string): Promise<{ success: boolean; disputeProducts: any }> {
    this.logger.log(`🔍 Récupération des produits en litige pour la commande ${orderId}...`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/disputes/disputeProducts', { orderId }, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ ${result.data.productInfoList.length} produits en litige trouvés`);
        return {
          success: true,
          disputeProducts: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des produits en litige');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération produits litige: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirme un litige
   */
  async confirmDispute(params: {
    orderId: string;
    productInfoList: Array<{
      lineItemId: string;
      quantity: string;
      price?: number;
    }>;
  }): Promise<{ success: boolean; disputeInfo: any }> {
    this.logger.log(`✅ Confirmation du litige pour la commande ${params.orderId}...`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/disputes/disputeConfirmInfo', params);
      
      if (result.code === 200) {
        this.logger.log(`✅ Litige confirmé avec succès`);
        return {
          success: true,
          disputeInfo: result.data
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la confirmation du litige');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur confirmation litige: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crée un litige
   */
  async createDispute(params: {
    orderId: string;
    businessDisputeId: string;
    disputeReasonId: number;
    expectType: number; // 1: Refund, 2: Reissue
    refundType: number; // 1: balance, 2: platform
    messageText: string;
    imageUrl?: string[];
    videoUrl?: string[];
    productInfoList: Array<{
      lineItemId: string;
      quantity: string;
      price: number;
    }>;
  }): Promise<{ success: boolean; disputeId: string; message: string }> {
    this.logger.log(`📝 Création d'un litige pour la commande ${params.orderId}...`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/disputes/create', params);
      
      if (result.code === 200) {
        this.logger.log(`✅ Litige créé avec succès`);
        return {
          success: true,
          disputeId: result.redirectUri || 'N/A',
          message: 'Litige créé avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la création du litige');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur création litige: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Annule un litige
   */
  async cancelDispute(params: {
    orderId: string;
    disputeId: string;
  }): Promise<{ success: boolean; message: string }> {
    this.logger.log(`❌ Annulation du litige ${params.disputeId} pour la commande ${params.orderId}...`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/disputes/cancel', params);
      
      if (result.code === 200) {
        this.logger.log(`✅ Litige annulé avec succès`);
        return {
          success: true,
          message: 'Litige annulé avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'annulation du litige');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur annulation litige: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère la liste des litiges
   */
  async getDisputeList(params: {
    orderId?: string;
    disputeId?: number;
    orderNumber?: string;
    pageNum?: number;
    pageSize?: number;
  } = {}): Promise<{ success: boolean; disputes: any[]; total: number }> {
    this.logger.log('📋 Récupération de la liste des litiges...');
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/disputes/getDisputeList', params, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ ${result.data.list?.length || 0} litiges trouvés`);
        return {
          success: true,
          disputes: result.data.list || [],
          total: result.data.total || 0
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des litiges');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération litiges: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Analyse les statistiques des litiges
   */
  async getDisputeAnalytics(): Promise<{ success: boolean; analytics: any }> {
    this.logger.log('📊 Analyse des statistiques des litiges...');
    
    try {
      const disputes = await this.getDisputeList({ pageSize: 100 });
      
      if (disputes.success) {
        const analytics = {
          total: disputes.total,
          byStatus: {},
          byReason: {},
          bySupplier: {},
          avgResolutionTime: 0,
          totalRefundAmount: 0,
          totalReissueAmount: 0
        };
        
        disputes.disputes.forEach(dispute => {
          // Statistiques par statut
          if (!analytics.byStatus[dispute.status]) {
            analytics.byStatus[dispute.status] = 0;
          }
          analytics.byStatus[dispute.status]++;
          
          // Statistiques par raison
          if (dispute.disputeReason) {
            if (!analytics.byReason[dispute.disputeReason]) {
              analytics.byReason[dispute.disputeReason] = 0;
            }
            analytics.byReason[dispute.disputeReason]++;
          }
          
          // Statistiques par fournisseur
          if (dispute.productList && dispute.productList.length > 0) {
            dispute.productList.forEach(product => {
              if (product.supplierName) {
                if (!analytics.bySupplier[product.supplierName]) {
                  analytics.bySupplier[product.supplierName] = 0;
                }
                analytics.bySupplier[product.supplierName]++;
              }
            });
          }
          
          // Montants
          if (dispute.money) {
            analytics.totalRefundAmount += parseFloat(dispute.money);
          }
          if (dispute.replacementAmount) {
            analytics.totalReissueAmount += parseFloat(dispute.replacementAmount);
          }
        });
        
        this.logger.log(`✅ Analytics des litiges calculées`);
        return {
          success: true,
          analytics
        };
      } else {
        throw new Error('Erreur lors de la récupération des litiges pour l\'analyse');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur analytics litiges: ${error.message}`, error.stack);
      throw error;
    }
  }
}
