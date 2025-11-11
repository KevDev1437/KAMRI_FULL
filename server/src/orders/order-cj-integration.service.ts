import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJOrderService } from '../cj-dropshipping/services/cj-order.service';

@Injectable()
export class OrderCJIntegrationService {
  private readonly logger = new Logger(OrderCJIntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private cjOrderService: CJOrderService, // Utiliser CJOrderService qui charge la config depuis la base
  ) {}

  /**
   * Détecter si une commande contient des produits CJ
   */
  async hasCJProducts(orderId: string): Promise<boolean> {
    this.logger.log(`🔍 Vérification produits CJ pour commande ${orderId}`);
    
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                cjMapping: true, // Relation vers CJProductMapping
                productVariants: {
                  where: {
                    isActive: true,
                    cjVariantId: { not: null },
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Commande introuvable');
    }

    // Vérifier si au moins un produit a un mapping CJ
    const hasCJ = order.items.some(item => 
      item.product.cjMapping !== null || 
      (item.product.cjProductId !== null && item.product.source === 'cj-dropshipping')
    );

    this.logger.log(`${hasCJ ? '✅' : '❌'} Produits CJ trouvés: ${hasCJ}`);
    
    return hasCJ;
  }

  /**
   * Transformer une commande KAMRI en format CJ
   */
  async transformOrderToCJ(orderId: string) {
    this.logger.log(`🔄 Transformation commande ${orderId} vers format CJ`);
    
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            addresses: {
              where: {
                isDefault: true,
              },
              take: 1,
            },
          },
        },
        items: {
          include: {
            product: {
              include: {
                cjMapping: true,
                images: true, // Inclure les images du produit
                productVariants: {
                  where: {
                    isActive: true,
                    cjVariantId: { not: null },
                  },
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Commande introuvable');
    }

    // Récupérer l'adresse de livraison
    const shippingAddress = await this.getShippingAddress(order);

    // Construire les produits au format CJ
    const cjProducts = [];
    const errors = [];

    this.logger.log(`📋 ${order.items.length} article(s) dans la commande`);
    
    for (const item of order.items) {
      const product = item.product;
      
      this.logger.log(`\n🔍 Analyse produit: ${product.name} (${product.id})`);
      this.logger.log(`   cjProductId: ${product.cjProductId || '(aucun)'}`);
      this.logger.log(`   source: ${product.source || '(aucune)'}`);
      this.logger.log(`   variants chargés: ${product.productVariants?.length || 0}`);
      
      // Vérifier si le produit est un produit CJ
      const isCJProduct = product.cjMapping !== null || 
                         (product.cjProductId !== null && product.source === 'cj-dropshipping');
      
      if (!isCJProduct) {
        this.logger.log(`⏭️ Produit ${product.id} n'est pas un produit CJ, skip`);
        continue;
      }
      
      this.logger.log(`✅ Produit CJ détecté - Recherche variant...`);

      // Récupérer le variant CJ
      // Si le produit a des variants, prendre le premier actif avec cjVariantId
      let vid: string | null = null;
      let sku: string | null = null;
      let activeVariant: any = null;

      if (product.productVariants && product.productVariants.length > 0) {
        // Chercher un variant actif avec cjVariantId
        activeVariant = product.productVariants.find(
          v => v.isActive && v.cjVariantId && v.cjVariantId.trim() !== ''
        );
        
        if (activeVariant) {
          vid = activeVariant.cjVariantId;
          sku = activeVariant.sku || product.productSku || null;
          this.logger.log(`✅ Variant trouvé pour produit ${product.id}: vid=${vid}, sku=${sku}`);
        } else {
          this.logger.warn(`⚠️ Produit ${product.id} a des variants mais aucun n'est actif avec cjVariantId`);
          // Essayer le premier variant même s'il n'est pas actif
          const firstVariant = product.productVariants[0];
          if (firstVariant?.cjVariantId && firstVariant.cjVariantId.trim() !== '') {
            activeVariant = firstVariant;
            vid = firstVariant.cjVariantId;
            sku = firstVariant.sku || product.productSku || null;
            this.logger.warn(`⚠️ Utilisation du premier variant (peut-être inactif): vid=${vid}`);
          }
        }
      } else {
        // Si pas de variant, on ne peut pas créer la commande CJ
        // Le vid est obligatoire selon l'API CJ
        this.logger.error(`❌ Produit ${product.id} (${product.name}) n'a pas de variant CJ avec cjVariantId`);
        errors.push({
          item: item.id,
          productId: product.id,
          productName: product.name,
          error: 'Produit sans variant CJ actif. Veuillez synchroniser les variants du produit.',
        });
        continue;
      }

      if (!vid || vid.trim() === '') {
        errors.push({
          item: item.id,
          productId: product.id,
          productName: product.name,
          error: 'Pas de variant ID CJ (vid) valide trouvé pour ce produit',
        });
        continue;
      }

      // Valider le format du vid (doit être un UUID ou un ID numérique)
      if (!/^[a-zA-Z0-9\-]+$/.test(vid.trim())) {
        this.logger.error(`❌ Format vid invalide pour produit ${product.id}: "${vid}"`);
        errors.push({
          item: item.id,
          productId: product.id,
          productName: product.name,
          error: `Format vid invalide: "${vid}"`,
        });
        continue;
      }

      // Validation finale du vid avant ajout
      const trimmedVid = vid.trim();
      if (trimmedVid.length === 0) {
        this.logger.error(`❌ VID vide après trim pour produit ${product.id}`);
        errors.push({
          item: item.id,
          productId: product.id,
          productName: product.name,
          error: 'VID vide après traitement',
        });
        continue;
      }

      // Récupérer les images du produit pour productionImgList
      let productionImgList: string[] = [];
      if (product.images && product.images.length > 0) {
        // Images depuis la relation Prisma
        productionImgList = product.images.map(img => img.url).filter(url => url && url.trim() !== '');
      } else if (product.image) {
        // Image stockée comme chaîne JSON ou URL simple
        try {
          if (typeof product.image === 'string' && product.image.startsWith('[')) {
            // Chaîne JSON
            const parsed = JSON.parse(product.image);
            if (Array.isArray(parsed)) {
              productionImgList = parsed.filter(url => url && typeof url === 'string' && url.trim() !== '');
            }
          } else if (typeof product.image === 'string') {
            // URL simple
            productionImgList = [product.image];
          }
        } catch (e) {
          // Si le parsing échoue, utiliser l'image telle quelle
          if (typeof product.image === 'string' && product.image.trim() !== '') {
            productionImgList = [product.image];
          }
        }
      }

      // Si aucune image n'est trouvée, utiliser l'image du variant ou une image par défaut
      if (productionImgList.length === 0 && activeVariant?.image) {
        productionImgList = [activeVariant.image];
      }

      // Si toujours aucune image, utiliser l'image du produit CJ si disponible
      if (productionImgList.length === 0 && product.cjProductId) {
        // Essayer de récupérer l'image depuis le produit directement
        // Le mapping CJ ne contient pas d'image, on utilise product.image
        if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
          productionImgList = [product.image];
        }
      }

      this.logger.log(`✅ Produit ${product.id} ajouté avec vid="${trimmedVid}", quantity=${item.quantity}, images=${productionImgList.length}`);

      cjProducts.push({
        vid: trimmedVid,
        quantity: item.quantity,
        storeLineItemId: item.id, // ID de OrderItem pour le mapping
        productionImgList: productionImgList.length > 0 ? productionImgList : undefined, // Optionnel mais requis par CJ
      });
    }

    if (cjProducts.length === 0) {
      throw new Error('Aucun produit CJ valide trouvé dans la commande');
    }

    // Construire l'objet commande CJ
    // ⚠️ IMPORTANT: shippingProvince est REQUIS selon la documentation CJ
    if (!shippingAddress.state || shippingAddress.state.trim() === '') {
      this.logger.warn(`⚠️ shippingProvince manquant pour commande ${orderId}, utilisation valeur par défaut`);
      shippingAddress.state = 'N/A'; // Valeur par défaut si manquant
    }

    const cjOrderData = {
      orderNumber: `KAMRI-${order.id.substring(0, 8)}-${Date.now()}`,
      shippingCustomerName: shippingAddress.name,
      shippingAddress: shippingAddress.address1,
      shippingAddress2: shippingAddress.address2 || undefined,
      shippingCity: shippingAddress.city,
      shippingProvince: shippingAddress.state, // Requis selon doc CJ
      shippingZip: shippingAddress.zip,
      shippingCountry: shippingAddress.country,
      shippingCountryCode: shippingAddress.countryCode,
      shippingPhone: shippingAddress.phone || order.user.phone || '',
      email: order.user.email,
      logisticName: this.selectLogistic(shippingAddress.countryCode),
      fromCountryCode: 'CN',
      platform: 'kamri',
      shopAmount: String(order.total),
      products: cjProducts,
    };

    return { 
      cjOrderData, 
      errors: errors.length > 0 ? errors : null,
    };
  }

  /**
   * Créer automatiquement une commande CJ
   */
  async createCJOrder(orderId: string) {
    this.logger.log(`🚀 === CRÉATION COMMANDE CJ POUR ${orderId} ===`);
    
    try {
      // 1. Vérifier si mapping existe déjà
      const existingMapping = await this.prisma.cJOrderMapping.findUnique({
        where: { orderId },
      });

      if (existingMapping) {
        this.logger.warn(`⚠️ Commande CJ déjà créée: ${existingMapping.cjOrderId}`);
        return {
          success: false,
          message: 'Commande CJ déjà existante',
          cjOrderId: existingMapping.cjOrderId,
          mapping: existingMapping,
        };
      }

      // 2. Vérifier que la commande contient des produits CJ
      const hasCJ = await this.hasCJProducts(orderId);
      
      if (!hasCJ) {
        this.logger.log('ℹ️ Commande sans produits CJ, skip');
        return {
          success: false,
          message: 'Commande sans produits CJ',
          skipped: true,
        };
      }

      // 3. Transformer la commande
      const { cjOrderData, errors } = await this.transformOrderToCJ(orderId);

      if (errors && errors.length > 0) {
        this.logger.warn('⚠️ Erreurs transformation:', JSON.stringify(errors, null, 2));
      }

      // Log des produits avant validation
      this.logger.log(`📦 ${cjOrderData.products.length} produit(s) transformé(s) avant validation`);
      cjOrderData.products.forEach((p, idx) => {
        this.logger.log(`  Produit ${idx + 1}: vid="${p.vid}", quantity=${p.quantity}, storeLineItemId="${p.storeLineItemId}"`);
      });

      // 4. Créer la commande CJ via le service qui charge la config depuis la base
      this.logger.log('📤 Envoi commande à CJ...');
      
      // Filtrer et valider les produits avant envoi
      const validProducts = cjOrderData.products
        .filter(p => {
          if (!p.vid || p.vid.trim() === '') {
            this.logger.warn(`⚠️ Produit sans vid ignoré:`, p);
            return false;
          }
          if (!p.quantity || p.quantity <= 0) {
            this.logger.warn(`⚠️ Produit avec quantité invalide ignoré:`, p);
            return false;
          }
          return true;
        })
        .map(p => {
          // S'assurer que vid est une string (CJ attend des strings même pour les IDs numériques)
          const vid = String(p.vid!).trim();
          // S'assurer que quantity est un nombre
          const quantity = Number(p.quantity);
          
          return {
            vid: vid,
            quantity: quantity,
            storeLineItemId: p.storeLineItemId || undefined, // Ne pas envoyer si vide
          };
        });

      if (validProducts.length === 0) {
        throw new Error('Aucun produit valide à envoyer à CJ (tous les produits ont été filtrés)');
      }

      this.logger.log(`✅ ${validProducts.length} produit(s) valide(s) à envoyer à CJ (sur ${cjOrderData.products.length} total)`);
      validProducts.forEach((p, idx) => {
        this.logger.log(`  ✅ Produit ${idx + 1}: vid="${p.vid}", quantity=${p.quantity}`);
      });

      // ⚠️ VALIDATION CRITIQUE: Vérifier que les vid sont au bon format
      // Les vid CJ sont généralement des nombres longs (ex: 2511110221331614100)
      // ou des UUID (ex: 92511400-C758-4474-93CA-66D442F5F787)
      const invalidVids = validProducts.filter(p => {
        const vid = p.vid.trim();
        // Vérifier que c'est soit un nombre, soit un UUID
        const isNumeric = /^\d+$/.test(vid);
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(vid);
        const isValidFormat = isNumeric || isUUID || /^[0-9a-fA-F\-]+$/.test(vid);
        
        if (!isValidFormat) {
          this.logger.error(`❌ Format vid invalide: "${vid}" (doit être numérique ou UUID)`);
          return true;
        }
        return false;
      });

      if (invalidVids.length > 0) {
        throw new Error(`${invalidVids.length} produit(s) avec format vid invalide`);
      }

      // Log final des vid qui seront envoyés
      this.logger.log(`\n📤 VID qui seront envoyés à CJ:`);
      validProducts.forEach((p, idx) => {
        this.logger.log(`  ${idx + 1}. vid="${p.vid}" (${p.vid.length} caractères, ${/^\d+$/.test(p.vid) ? 'numérique' : 'UUID/autre'}), quantity=${p.quantity}, storeLineItemId="${p.storeLineItemId || 'N/A'}"`);
      });
      
      // Log complet de la requête qui sera envoyée (pour débogage)
      this.logger.log(`\n📋 PAYLOAD COMPLET qui sera envoyé à CJ:`);
      this.logger.log(JSON.stringify({
        orderNumber: cjOrderData.orderNumber,
        shippingCountryCode: cjOrderData.shippingCountryCode,
        shippingCountry: cjOrderData.shippingCountry,
        shippingProvince: cjOrderData.shippingProvince,
        shippingCity: cjOrderData.shippingCity,
        shippingAddress: cjOrderData.shippingAddress,
        shippingCustomerName: cjOrderData.shippingCustomerName,
        shippingPhone: cjOrderData.shippingPhone || '(vide)',
        logisticName: cjOrderData.logisticName,
        fromCountryCode: cjOrderData.fromCountryCode || 'CN',
        platform: cjOrderData.platform || 'kamri',
        products: validProducts,
      }, null, 2));
      
      // Transformer au format CJOrderCreateDto (selon documentation officielle)
      const orderDto = {
        orderNumber: cjOrderData.orderNumber,
        shippingCountryCode: cjOrderData.shippingCountryCode,
        shippingCountry: cjOrderData.shippingCountry,
        shippingProvince: cjOrderData.shippingProvince, // Requis selon doc
        shippingCity: cjOrderData.shippingCity,
        shippingAddress: cjOrderData.shippingAddress,
        shippingAddress2: cjOrderData.shippingAddress2, // Optionnel mais utile
        shippingZip: cjOrderData.shippingZip, // Optionnel mais utile
        shippingCustomerName: cjOrderData.shippingCustomerName,
        shippingPhone: cjOrderData.shippingPhone, // Optionnel selon doc
        email: cjOrderData.email, // Optionnel mais utile pour notifications
        logisticName: cjOrderData.logisticName,
        fromCountryCode: cjOrderData.fromCountryCode || 'CN',
        platform: cjOrderData.platform || 'kamri',
        shopAmount: cjOrderData.shopAmount, // Optionnel mais utile pour tracking
        products: validProducts,
      };

      // Log des données envoyées (sans les produits qui sont déjà loggés)
      this.logger.log('📋 Données de commande envoyées à CJ:');
      this.logger.log(`  orderNumber: "${orderDto.orderNumber}"`);
      this.logger.log(`  shippingCountryCode: "${orderDto.shippingCountryCode}"`);
      this.logger.log(`  shippingCountry: "${orderDto.shippingCountry}"`);
      this.logger.log(`  shippingProvince: "${orderDto.shippingProvince}"`);
      this.logger.log(`  shippingCity: "${orderDto.shippingCity}"`);
      this.logger.log(`  shippingAddress: "${orderDto.shippingAddress}"`);
      this.logger.log(`  shippingCustomerName: "${orderDto.shippingCustomerName}"`);
      this.logger.log(`  shippingPhone: "${orderDto.shippingPhone || '(vide)'}"`);
      this.logger.log(`  logisticName: "${orderDto.logisticName}"`);
      this.logger.log(`  platform: "${orderDto.platform}"`);
      this.logger.log(`  products: ${orderDto.products.length} produit(s)`);
      
      const result = await this.cjOrderService.createOrder(orderDto);

      if (!result.orderId) {
        throw new Error(result.message || 'Échec création commande CJ');
      }

      // 5. Créer le mapping avec les montants détaillés
      const mapping = await this.prisma.cJOrderMapping.create({
        data: {
          orderId: orderId,
          cjOrderId: result.orderId,
          cjOrderNumber: cjOrderData.orderNumber,
          status: result.status || 'CREATED',
          trackNumber: null,
          // Stocker les montants détaillés dans metadata (JSON)
          metadata: JSON.stringify({
            productAmount: result.productAmount || 0,
            postageAmount: result.postageAmount || 0,
            productOriginalAmount: result.productOriginalAmount || 0,
            postageOriginalAmount: result.postageOriginalAmount || 0,
            totalDiscountAmount: result.totalDiscountAmount || 0,
            orderAmount: result.totalAmount || 0,
            createdAt: new Date().toISOString(),
          }),
        },
      });

      this.logger.log(`✅ Commande CJ créée: ${result.orderId}`);
      this.logger.log(`✅ Mapping créé: ${mapping.id}`);

      return {
        success: true,
        message: 'Commande CJ créée avec succès',
        cjOrderId: result.orderId,
        cjOrderNumber: cjOrderData.orderNumber,
        mapping: mapping,
        errors: errors,
      };

    } catch (error: any) {
      this.logger.error(`❌ Erreur création commande CJ:`, error);
      
      // Marquer la commande en erreur
      await this.markOrderAsError(orderId, error.message);
      
      return {
        success: false,
        message: error.message || 'Erreur inconnue lors de la création de la commande CJ',
        error: error.message,
      };
    }
  }

  /**
   * Récupérer l'adresse de livraison
   */
  private async getShippingAddress(order: any) {
    // Option 1 : Si l'adresse est dans Order directement (à vérifier dans votre schéma)
    // if (order.shippingAddress) {
    //   return {
    //     name: order.shippingName || `${order.user.firstName} ${order.user.lastName}`,
    //     address1: order.shippingAddress,
    //     address2: order.shippingAddress2,
    //     city: order.shippingCity,
    //     state: order.shippingState,
    //     zip: order.shippingZip,
    //     country: order.shippingCountry,
    //     countryCode: this.getCountryCode(order.shippingCountry),
    //     phone: order.shippingPhone || order.user.phone,
    //   };
    // }

    // Option 2 : Si l'adresse est dans une table séparée (Address)
    let address = null;
    
    if (order.user.addresses && order.user.addresses.length > 0) {
      address = order.user.addresses[0];
    } else {
      // Chercher une adresse par défaut
      address = await this.prisma.address.findFirst({
        where: {
          userId: order.userId,
          isDefault: true,
        },
      });
    }

    if (!address) {
      // Si pas d'adresse, utiliser les infos de l'utilisateur
      this.logger.warn(`⚠️ Pas d'adresse trouvée pour user ${order.userId}, utilisation des infos utilisateur`);
      return {
        name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.name || 'Client',
        address1: order.user.address || 'Adresse non spécifiée',
        address2: '',
        city: 'Ville non spécifiée',
        state: 'État non spécifié',
        zip: '00000',
        country: order.user.address || 'United States',
        countryCode: 'US',
        phone: order.user.phone || '',
      };
    }

    return {
      name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.name || 'Client',
      address1: address.street,
      address2: '',
      city: address.city,
      state: address.state,
      zip: address.zipCode,
      country: address.country,
      countryCode: this.getCountryCode(address.country),
      phone: order.user.phone || '',
    };
  }

  /**
   * Sélectionner la logistique selon le pays
   */
  private selectLogistic(countryCode: string): string {
    const logistics: Record<string, string> = {
      'US': 'USPS',
      'CA': 'Canada Post',
      'GB': 'Royal Mail',
      'FR': 'Colissimo',
      'DE': 'DHL',
      'ES': 'Correos',
      'IT': 'Poste Italiane',
      'AU': 'Australia Post',
      'JP': 'Japan Post',
      'CN': 'China Post',
    };
    
    return logistics[countryCode] || 'CJ Packet';
  }

  /**
   * Obtenir le code pays depuis le nom
   */
  private getCountryCode(countryName: string): string {
    const codes: Record<string, string> = {
      'United States': 'US',
      'USA': 'US',
      'France': 'FR',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'UK': 'GB',
      'Germany': 'DE',
      'Deutschland': 'DE',
      'Spain': 'ES',
      'España': 'ES',
      'Italy': 'IT',
      'Italia': 'IT',
      'Australia': 'AU',
      'Japan': 'JP',
      'China': 'CN',
      'Chine': 'CN',
    };
    
    // Si c'est déjà un code (2 lettres), le retourner tel quel
    if (countryName.length === 2 && countryName === countryName.toUpperCase()) {
      return countryName;
    }
    
    return codes[countryName] || 'US';
  }

  /**
   * Marquer une commande en erreur
   */
  private async markOrderAsError(orderId: string, errorMessage: string) {
    // Log l'erreur pour traçabilité
    this.logger.error(`Commande ${orderId} en erreur: ${errorMessage}`);
    
    // TODO: Si vous avez un champ errorMessage dans Order, l'utiliser
    // await this.prisma.order.update({
    //   where: { id: orderId },
    //   data: { errorMessage: errorMessage },
    // });
    
    // Ou créer une table OrderError pour tracker les erreurs
    // await this.prisma.orderError.create({
    //   data: {
    //     orderId: orderId,
    //     errorMessage: errorMessage,
    //     errorType: 'CJ_CREATION_FAILED',
    //   },
    // });
  }
}

