import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      include: {
        products: true,
        categoryMappings: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        categoryMappings: true,
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async testConnection(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new Error('Fournisseur non trouvé');
    }

    // Simulation du test de connexion
    const isConnected = Math.random() > 0.3; // 70% de chance de succès

    if (isConnected) {
      await this.prisma.supplier.update({
        where: { id },
        data: {
          status: 'connected',
          lastSync: new Date(),
        },
      });
      return { success: true, message: 'Connexion réussie' };
    } else {
      await this.prisma.supplier.update({
        where: { id },
        data: { status: 'disconnected' },
      });
      return { success: false, message: 'Échec de la connexion' };
    }
  }

  async getStats() {
    const total = await this.prisma.supplier.count();
    const connected = await this.prisma.supplier.count({
      where: { status: 'connected' },
    });
    const products = await this.prisma.product.count({
      where: { supplierId: { not: null } },
    });

    return {
      total,
      connected,
      disconnected: total - connected,
      products,
    };
  }

  async importProducts(supplierId: string) {
    console.log('🚀 === DÉBUT IMPORT PRODUITS ===');
    console.log('🔍 Supplier ID:', supplierId);
    
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      console.log('❌ Fournisseur non trouvé pour ID:', supplierId);
      throw new Error('Fournisseur non trouvé');
    }

    console.log('✅ Fournisseur trouvé:', supplier.name);

    try {
      // Import depuis Fake Store API
      console.log('🔄 Début de l\'import depuis Fake Store API...');
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) {
        console.log('❌ Erreur HTTP:', response.status, response.statusText);
        throw new Error('Erreur lors de la récupération des produits');
      }
      
      const fakeProducts = await response.json();
      console.log(`📦 ${fakeProducts.length} produits récupérés depuis Fake Store API`);
      console.log('📋 Premiers produits:', fakeProducts.slice(0, 3).map(p => ({ title: p.title, category: p.category })));
      
      const importedProducts = [];
      
      for (const fakeProduct of fakeProducts) {
        try {
          console.log(`\n🔄 === TRAITEMENT PRODUIT ===`);
          console.log(`📝 Titre: ${fakeProduct.title}`);
          console.log(`🏷️ Catégorie externe: "${fakeProduct.category}"`);
          console.log(`💰 Prix: ${fakeProduct.price}`);
          
          // Mapper les catégories Fake Store vers nos catégories
          const categoryId = await this.mapFakeStoreCategory(fakeProduct.category, supplier.id);
          console.log(`✅ Catégorie mappée vers ID: ${categoryId}`);
          
          // TOUS les produits importés sont en attente de catégorisation et validation
          const productData: any = {
            name: fakeProduct.title,
            description: fakeProduct.description,
            price: fakeProduct.price,
            originalPrice: fakeProduct.price * 1.2, // Prix original fictif
            image: fakeProduct.image,
            supplierId: supplier.id,
            externalCategory: fakeProduct.category, // Sauvegarder la catégorie externe
            status: 'pending', // TOUS les produits en attente de catégorisation
            badge: this.generateBadge(),
            stock: Math.floor(Math.random() * 50) + 10,
          };

          // Ajouter categoryId seulement si une catégorie est assignée
          if (categoryId) {
            productData.categoryId = categoryId;
          }

          const product = await this.prisma.product.create({
            data: productData,
            include: {
              category: true,
              supplier: true,
            },
          });
          console.log(`✅ Produit créé: ${product.name} (statut: pending - en attente de catégorisation)`);
          console.log(`📊 ID produit: ${product.id}`);
          importedProducts.push(product);
        } catch (error) {
          console.error(`❌ Erreur lors de la création du produit ${fakeProduct.title}:`, error);
        }
      }

      console.log(`\n🎉 === IMPORT TERMINÉ ===`);
      console.log(`📊 Total produits importés: ${importedProducts.length}`);
      console.log(`🏢 Fournisseur: ${supplier.name}`);
      console.log(`📋 Produits:`, importedProducts.map(p => ({ name: p.name, category: p.category?.name, status: p.status })));

      return {
        message: `${importedProducts.length} produits importés depuis Fake Store API - Tous en attente de catégorisation`,
        products: importedProducts,
        supplier: supplier.name,
        workflow: 'Import → Catégorisation → Validation → Active'
      };
    } catch (error) {
      console.log('❌ === ERREUR IMPORT ===');
      console.log('💥 Erreur:', error);
      throw new Error(`Erreur lors de l'import: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async mapFakeStoreCategory(fakeCategory: string, supplierId: string): Promise<string> {
    console.log(`\n🔍 === MAPPING CATÉGORIE ===`);
    console.log(`🏷️ Catégorie externe: "${fakeCategory}"`);
    console.log(`🏢 Supplier ID: ${supplierId}`);
    
    // Vérifier s'il existe déjà un mapping pour cette catégorie externe
    console.log(`🔎 Recherche mapping existant...`);
    const existingMapping = await this.prisma.categoryMapping.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });

    if (existingMapping) {
      console.log(`✅ Mapping existant trouvé:`, existingMapping);
      // Trouver la catégorie interne correspondante
      const internalCategory = await this.prisma.category.findFirst({
        where: { name: existingMapping.internalCategory }
      });
      
      if (internalCategory) {
        console.log(`✅ Catégorie interne trouvée: ${internalCategory.name} (ID: ${internalCategory.id})`);
        return internalCategory.id;
      }
    } else {
      console.log(`❌ Aucun mapping existant pour "${fakeCategory}"`);
    }

    // Si pas de mapping, enregistrer comme catégorie non mappée
    console.log(`📝 Enregistrement catégorie non mappée...`);
    try {
      await this.prisma.unmappedExternalCategory.upsert({
        where: {
          supplierId_externalCategory: {
            supplierId: supplierId,
            externalCategory: fakeCategory
          }
        },
        update: {
          productCount: {
            increment: 1
          }
        },
        create: {
          externalCategory: fakeCategory,
          supplierId: supplierId,
          productCount: 1
        }
      });
      console.log(`✅ Catégorie non mappée enregistrée: ${fakeCategory}`);
    } catch (error) {
      console.log(`❌ Erreur enregistrement catégorie non mappée:`, error);
    }
    
    // Vérifier ce qui a été enregistré
    const savedCategory = await this.prisma.unmappedExternalCategory.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });
    console.log(`🔍 Catégorie sauvegardée:`, savedCategory);
    
    // Pas de fallback - laisser en attente de catégorisation manuelle
    console.log(`⏳ Produit laissé en attente de catégorisation manuelle`);
    console.log(`📝 Catégorie externe "${fakeCategory}" doit être mappée manuellement`);
    
    // Retourner null pour indiquer qu'aucune catégorie n'est assignée
    return null;
  }

  private generateBadge(): string | null {
    const badges = ['promo', 'nouveau', 'tendances', 'top-ventes', null];
    return badges[Math.floor(Math.random() * badges.length)];
  }
}
