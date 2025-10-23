import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CJLogisticsOption {
  id: number;
  chineseName: string;
  englishName: string;
  arrivalTime: string;
  minDays: number;
  maxDays: number;
  isExpress: boolean;
  isSensitive: boolean;
  supportedCountries: string[];
}

@Injectable()
export class CJLogisticsService {
  private readonly logger = new Logger(CJLogisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liste complète des logistiques CJ
   */
  private readonly logisticsOptions: CJLogisticsOption[] = [
    { id: 1, chineseName: '瑞邮宝PG', englishName: 'Wedenpost', arrivalTime: '7-20', minDays: 7, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['DE', 'AT', 'CH'] },
    { id: 2, chineseName: 'E邮宝', englishName: 'ePacket', arrivalTime: '7-20', minDays: 7, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['US', 'CA', 'GB', 'AU'] },
    { id: 3, chineseName: '马电宝PG', englishName: 'Pos Malaysia', arrivalTime: '10-45', minDays: 10, maxDays: 45, isExpress: false, isSensitive: true, supportedCountries: ['MY', 'SG'] },
    { id: 4, chineseName: '马电宝十国PG', englishName: 'MYSG', arrivalTime: '10-45', minDays: 10, maxDays: 45, isExpress: false, isSensitive: true, supportedCountries: ['MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'KH', 'LA', 'MM', 'BN'] },
    { id: 5, chineseName: 'B邮宝挂号', englishName: 'Bpost', arrivalTime: '7-20', minDays: 7, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['BE', 'NL', 'LU'] },
    { id: 6, chineseName: '易邮通PG', englishName: 'Singpost', arrivalTime: '7-20', minDays: 7, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['SG'] },
    { id: 7, chineseName: 'HK挂号', englishName: 'HKpost', arrivalTime: '7-20', minDays: 7, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['HK'] },
    { id: 8, chineseName: '通达宝PG', englishName: 'Turkey Post', arrivalTime: '11-35', minDays: 11, maxDays: 35, isExpress: false, isSensitive: false, supportedCountries: ['TR'] },
    { id: 9, chineseName: '通邮宝PG', englishName: 'Swiss Post', arrivalTime: '15-60', minDays: 15, maxDays: 60, isExpress: false, isSensitive: false, supportedCountries: ['CH'] },
    { id: 10, chineseName: '欧电宝PG', englishName: 'PostNL', arrivalTime: '15-45', minDays: 15, maxDays: 45, isExpress: false, isSensitive: true, supportedCountries: ['NL', 'BE', 'LU'] },
    { id: 11, chineseName: '官方E邮宝', englishName: 'ePacket+', arrivalTime: '5-15', minDays: 5, maxDays: 15, isExpress: true, isSensitive: false, supportedCountries: ['US', 'CA'] },
    { id: 12, chineseName: 'USPS美国专线', englishName: 'USPS', arrivalTime: '10-20', minDays: 10, maxDays: 20, isExpress: false, isSensitive: false, supportedCountries: ['US'] },
    { id: 13, chineseName: '法国专线', englishName: 'La Poste', arrivalTime: '4-12', minDays: 4, maxDays: 12, isExpress: true, isSensitive: false, supportedCountries: ['FR'] },
    { id: 14, chineseName: '英国专线', englishName: 'Yodel', arrivalTime: '4-12', minDays: 4, maxDays: 12, isExpress: true, isSensitive: false, supportedCountries: ['GB'] },
    { id: 15, chineseName: '德国专线', englishName: 'DHL Paket', arrivalTime: '4-12', minDays: 4, maxDays: 12, isExpress: true, isSensitive: false, supportedCountries: ['DE'] },
    { id: 16, chineseName: '中国邮政小包挂号不带电', englishName: 'China Post Registered Air Mail', arrivalTime: '25-55', minDays: 25, maxDays: 55, isExpress: false, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 17, chineseName: '无忧标准', englishName: 'AliExpress Standard Shipping', arrivalTime: '19-39', minDays: 19, maxDays: 39, isExpress: false, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 18, chineseName: '无忧优先', englishName: 'Aliexpress Premium Shipping', arrivalTime: '7-15', minDays: 7, maxDays: 15, isExpress: true, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 19, chineseName: '欧邮宝DS', englishName: 'BPost+', arrivalTime: '15-25', minDays: 15, maxDays: 25, isExpress: false, isSensitive: false, supportedCountries: ['BE', 'NL', 'LU', 'FR', 'DE', 'IT', 'ES'] },
    { id: 20, chineseName: 'USPS+渠道', englishName: 'USPS+', arrivalTime: '4-10', minDays: 4, maxDays: 10, isExpress: true, isSensitive: false, supportedCountries: ['US'] },
    { id: 21, chineseName: 'DHL物流', englishName: 'DHL', arrivalTime: '3-7', minDays: 3, maxDays: 7, isExpress: true, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 22, chineseName: 'K邮宝', englishName: 'Korea Post', arrivalTime: '7-12', minDays: 7, maxDays: 12, isExpress: false, isSensitive: false, supportedCountries: ['KR'] },
    { id: 23, chineseName: '顺邮宝PLUS', englishName: 'CJPacket Liquid', arrivalTime: '7-30', minDays: 7, maxDays: 30, isExpress: false, isSensitive: true, supportedCountries: ['GLOBAL'] },
    { id: 24, chineseName: '德国专线挂号', englishName: 'YunExpress Germany Direct Line', arrivalTime: '5-10', minDays: 5, maxDays: 10, isExpress: true, isSensitive: false, supportedCountries: ['DE'] },
    { id: 25, chineseName: '意大利专线挂号', englishName: 'YunExpress Italy Direct Line', arrivalTime: '5-10', minDays: 5, maxDays: 10, isExpress: true, isSensitive: false, supportedCountries: ['IT'] },
    { id: 26, chineseName: '西班牙专线挂号', englishName: 'YunExpress Spain Direct Line', arrivalTime: '5-7', minDays: 5, maxDays: 7, isExpress: true, isSensitive: false, supportedCountries: ['ES'] },
    { id: 27, chineseName: '奥地利专线', englishName: 'YunExpress Austria Direct Line', arrivalTime: '5-10', minDays: 5, maxDays: 10, isExpress: true, isSensitive: false, supportedCountries: ['AT'] },
    { id: 28, chineseName: '云途中欧专线挂号', englishName: 'YunExpress Europe Direct Line', arrivalTime: '7-15', minDays: 7, maxDays: 15, isExpress: true, isSensitive: false, supportedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT'] },
    { id: 29, chineseName: '中美专线（特惠）', englishName: 'CJPacket YT US', arrivalTime: '12-22', minDays: 12, maxDays: 22, isExpress: false, isSensitive: false, supportedCountries: ['US'] },
    { id: 30, chineseName: '加拿大专线', englishName: 'YunExpress Canada Direct Line', arrivalTime: '5-7', minDays: 5, maxDays: 7, isExpress: true, isSensitive: false, supportedCountries: ['CA'] },
    { id: 50, chineseName: 'CJ物流', englishName: 'CJPacket', arrivalTime: '7-17', minDays: 7, maxDays: 17, isExpress: false, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 53, chineseName: 'DHL官方', englishName: 'DHL Official', arrivalTime: '3-7', minDays: 3, maxDays: 7, isExpress: true, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 54, chineseName: 'DHL eCommerce', englishName: 'DHL eCommerce', arrivalTime: '2-7', minDays: 2, maxDays: 7, isExpress: true, isSensitive: false, supportedCountries: ['GLOBAL'] },
    { id: 99, chineseName: '德国DHL', englishName: 'DHL DE', arrivalTime: '1-2', minDays: 1, maxDays: 2, isExpress: true, isSensitive: false, supportedCountries: ['DE'] },
    { id: 100, chineseName: '联邦小包', englishName: 'FedEx official', arrivalTime: '3-5', minDays: 3, maxDays: 5, isExpress: true, isSensitive: false, supportedCountries: ['GLOBAL'] }
  ];

  /**
   * Récupère toutes les options de logistique
   */
  async getAllLogistics(): Promise<CJLogisticsOption[]> {
    this.logger.log('📦 Récupération de toutes les options de logistique CJ');
    return this.logisticsOptions;
  }

  /**
   * Récupère les logistiques par pays
   */
  async getLogisticsByCountry(countryCode: string): Promise<CJLogisticsOption[]> {
    this.logger.log(`🌍 Récupération des logistiques pour le pays: ${countryCode}`);
    
    return this.logisticsOptions.filter(option => 
      option.supportedCountries.includes(countryCode) || 
      option.supportedCountries.includes('GLOBAL')
    );
  }

  /**
   * Récupère les logistiques express
   */
  async getExpressLogistics(): Promise<CJLogisticsOption[]> {
    this.logger.log('⚡ Récupération des logistiques express');
    
    return this.logisticsOptions.filter(option => option.isExpress);
  }

  /**
   * Récupère les logistiques pour produits sensibles
   */
  async getSensitiveLogistics(): Promise<CJLogisticsOption[]> {
    this.logger.log('🔋 Récupération des logistiques pour produits sensibles');
    
    return this.logisticsOptions.filter(option => option.isSensitive);
  }

  /**
   * Récupère les logistiques par délai
   */
  async getLogisticsByDeliveryTime(maxDays: number): Promise<CJLogisticsOption[]> {
    this.logger.log(`⏰ Récupération des logistiques avec délai max: ${maxDays} jours`);
    
    return this.logisticsOptions.filter(option => option.maxDays <= maxDays);
  }

  /**
   * Recherche de logistiques
   */
  async searchLogistics(query: string): Promise<CJLogisticsOption[]> {
    this.logger.log(`🔍 Recherche de logistiques: ${query}`);
    
    const searchTerm = query.toLowerCase();
    
    return this.logisticsOptions.filter(option => 
      option.chineseName.toLowerCase().includes(searchTerm) ||
      option.englishName.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Récupère les logistiques recommandées pour un pays
   */
  async getRecommendedLogistics(countryCode: string, isSensitive: boolean = false): Promise<CJLogisticsOption[]> {
    this.logger.log(`🎯 Logistiques recommandées pour ${countryCode} (sensible: ${isSensitive})`);
    
    let options = await this.getLogisticsByCountry(countryCode);
    
    if (isSensitive) {
      options = options.filter(option => option.isSensitive);
    }
    
    // Trier par délai (plus rapide en premier)
    return options.sort((a, b) => a.maxDays - b.maxDays);
  }

  /**
   * Calcule le coût estimé de livraison
   */
  async calculateShippingCost(
    logisticsId: number,
    weight: number,
    countryCode: string
  ): Promise<{ cost: number; currency: string; estimatedDays: string }> {
    this.logger.log(`💰 Calcul du coût de livraison - Logistique: ${logisticsId}, Poids: ${weight}g, Pays: ${countryCode}`);
    
    const logistics = this.logisticsOptions.find(option => option.id === logisticsId);
    
    if (!logistics) {
      throw new Error(`Logistique non trouvée: ${logisticsId}`);
    }
    
    // Calcul basique du coût (à adapter selon les vraies tarifs CJ)
    let baseCost = 0;
    
    if (logistics.isExpress) {
      baseCost = 15 + (weight * 0.05); // Express: 15$ + 0.05$/g
    } else {
      baseCost = 5 + (weight * 0.02); // Standard: 5$ + 0.02$/g
    }
    
    // Ajustement par pays
    const countryMultiplier = this.getCountryMultiplier(countryCode);
    const finalCost = baseCost * countryMultiplier;
    
    return {
      cost: Math.round(finalCost * 100) / 100,
      currency: 'USD',
      estimatedDays: logistics.arrivalTime
    };
  }

  /**
   * Multiplicateur de coût par pays
   */
  private getCountryMultiplier(countryCode: string): number {
    const multipliers: { [key: string]: number } = {
      'US': 1.0,
      'CA': 1.2,
      'GB': 1.3,
      'DE': 1.4,
      'FR': 1.4,
      'IT': 1.4,
      'ES': 1.4,
      'AU': 1.5,
      'JP': 1.6,
      'KR': 1.3,
      'SG': 1.1,
      'MY': 1.1,
      'TH': 1.1,
      'ID': 1.2,
      'PH': 1.3,
      'VN': 1.2,
      'BR': 1.8,
      'MX': 1.7,
      'IN': 1.4,
      'RU': 1.9
    };
    
    return multipliers[countryCode] || 1.5; // Par défaut 1.5x
  }

  /**
   * Synchronise les logistiques avec la base de données
   */
  async syncLogisticsToDatabase(): Promise<void> {
    this.logger.log('🔄 Synchronisation des logistiques CJ en base de données');
    
    try {
      for (const logistics of this.logisticsOptions) {
        await this.prisma.logistics.upsert({
          where: { cjId: logistics.id },
          update: {
            name: logistics.englishName,
            chineseName: logistics.chineseName,
            arrivalTime: logistics.arrivalTime,
            minDays: logistics.minDays,
            maxDays: logistics.maxDays,
            isExpress: logistics.isExpress,
            isSensitive: logistics.isSensitive,
            supportedCountries: logistics.supportedCountries,
            updatedAt: new Date(),
          },
          create: {
            cjId: logistics.id,
            name: logistics.englishName,
            chineseName: logistics.chineseName,
            arrivalTime: logistics.arrivalTime,
            minDays: logistics.minDays,
            maxDays: logistics.maxDays,
            isExpress: logistics.isExpress,
            isSensitive: logistics.isSensitive,
            supportedCountries: logistics.supportedCountries,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }
      
      this.logger.log(`✅ ${this.logisticsOptions.length} logistiques synchronisées`);
    } catch (error) {
      this.logger.error(`❌ Erreur synchronisation logistiques: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calcule le fret pour des produits
   */
  async calculateFreight(params: {
    startCountryCode: string;
    endCountryCode: string;
    zip?: string;
    taxId?: string;
    houseNumber?: string;
    iossNumber?: string;
    products: Array<{
      quantity: number;
      vid: string;
    }>;
  }): Promise<{ success: boolean; freightOptions: any[] }> {
    this.logger.log(`🚚 Calcul du fret: ${params.startCountryCode} → ${params.endCountryCode}`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/logistic/freightCalculate', params);
      
      if (result.code === 200) {
        this.logger.log(`✅ ${result.data.length} options de fret calculées`);
        return {
          success: true,
          freightOptions: result.data || []
        };
      } else {
        throw new Error(result.message || 'Erreur lors du calcul du fret');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur calcul fret: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calcule le fret avancé avec conseils
   */
  async calculateFreightTip(params: {
    reqDTOS: Array<{
      srcAreaCode: string;
      destAreaCode: string;
      length: number;
      width: number;
      height: number;
      volume: number;
      totalGoodsAmount: number;
      productProp: string[];
      freightTrialSkuList: Array<{
        skuQuantity: number;
        sku: string;
      }>;
      skuList: string[];
      platforms?: string[];
      customerCode?: string;
      zip?: string;
      houseNumber?: string;
      iossNumber?: string;
      storageIdList?: string;
      recipientAddress?: string;
      city?: string;
      recipientName?: string;
      town?: string;
      phone?: string;
      wrapWeight: number;
      station?: string;
      dutyNo?: string;
      email?: string;
      province?: string;
      recipientAddress1?: string;
      uid?: string;
      recipientId?: string;
      recipientAddress2?: string;
      amount?: number;
      productTypes?: string[];
      weight: number;
      optionName?: string;
      volumeWeight?: number;
      orderType?: string;
    }>;
  }): Promise<{ success: boolean; freightTips: any[] }> {
    this.logger.log(`💡 Calcul du fret avancé: ${params.reqDTOS.length} requêtes`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/logistic/freightCalculateTip', params);
      
      if (result.code === 200) {
        this.logger.log(`✅ ${result.data.length} conseils de fret calculés`);
        return {
          success: true,
          freightTips: result.data || []
        };
      } else {
        throw new Error(result.message || 'Erreur lors du calcul du fret avancé');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur calcul fret avancé: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère les informations de suivi (déprécié)
   */
  async getTrackingInfo(trackNumbers: string[]): Promise<{ success: boolean; trackingInfo: any[] }> {
    this.logger.log(`📦 Suivi des expéditions: ${trackNumbers.length} numéros`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const params: any = {};
      trackNumbers.forEach((trackNumber, index) => {
        params[`trackNumber`] = trackNumber;
      });
      
      const result = await client.makeRequest('/logistic/getTrackInfo', params, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ Informations de suivi récupérées pour ${result.data.length} expéditions`);
        return {
          success: true,
          trackingInfo: result.data || []
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération du suivi');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur suivi expéditions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère les informations de suivi (nouveau)
   */
  async getTrackInfo(trackNumbers: string[]): Promise<{ success: boolean; trackingInfo: any[] }> {
    this.logger.log(`📦 Suivi des expéditions (nouveau): ${trackNumbers.length} numéros`);
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const params: any = {};
      trackNumbers.forEach((trackNumber, index) => {
        params[`trackNumber`] = trackNumber;
      });
      
      const result = await client.makeRequest('/logistic/trackInfo', params, 'GET');
      
      if (result.code === 200) {
        this.logger.log(`✅ Informations de suivi récupérées pour ${result.data.length} expéditions`);
        return {
          success: true,
          trackingInfo: result.data || []
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération du suivi');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur suivi expéditions: ${error.message}`, error.stack);
      throw error;
    }
  }
}
