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
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new Error('Fournisseur non trouvé');
    }

    try {
      // Import depuis Fake Store API
      console.log('🔄 Début de l\'import depuis Fake Store API...');
      const response = await fetch('https://fakestoreapi.com/products?limit=10');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }
      
      const fakeProducts = await response.json();
      console.log(`📦 ${fakeProducts.length} produits récupérés depuis Fake Store API`);
      const importedProducts = [];
      
      for (const fakeProduct of fakeProducts) {
        try {
          console.log(`🔄 Traitement du produit: ${fakeProduct.title} (catégorie: ${fakeProduct.category})`);
          // Mapper les catégories Fake Store vers nos catégories
          const categoryId = await this.mapFakeStoreCategory(fakeProduct.category, supplier.id);
          console.log(`✅ Catégorie mappée vers ID: ${categoryId}`);
          
          const product = await this.prisma.product.create({
            data: {
              name: fakeProduct.title,
              description: fakeProduct.description,
              price: fakeProduct.price,
              originalPrice: fakeProduct.price * 1.2, // Prix original fictif
              image: fakeProduct.image,
              categoryId: categoryId,
              supplierId: supplier.id,
              status: 'pending', // Produits en attente de validation
              badge: this.generateBadge(),
              stock: Math.floor(Math.random() * 50) + 10,
            },
            include: {
              category: true,
              supplier: true,
            },
          });
          console.log(`✅ Produit créé: ${product.name}`);
          importedProducts.push(product);
        } catch (error) {
          console.error(`❌ Erreur lors de la création du produit ${fakeProduct.title}:`, error);
        }
      }

      return {
        message: `${importedProducts.length} produits importés depuis Fake Store API`,
        products: importedProducts,
        supplier: supplier.name,
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'import: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async mapFakeStoreCategory(fakeCategory: string, supplierId: string): Promise<string> {
    console.log(`🔍 Mapping catégorie: ${fakeCategory}`);
    
    // Vérifier s'il existe déjà un mapping pour cette catégorie externe
    const existingMapping = await this.prisma.categoryMapping.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });

    if (existingMapping) {
      // Trouver la catégorie interne correspondante
      const internalCategory = await this.prisma.category.findFirst({
        where: { name: existingMapping.internalCategory }
      });
      
      if (internalCategory) {
        console.log(`✅ Mapping existant trouvé: ${fakeCategory} -> ${internalCategory.name}`);
        return internalCategory.id;
      }
    }

    // Si pas de mapping, enregistrer comme catégorie non mappée
    // TODO: Réactiver après résolution du problème Prisma
    /*
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

    console.log(`📝 Catégorie non mappée enregistrée: ${fakeCategory}`);
    
    // Vérifier ce qui a été enregistré
    const savedCategory = await this.prisma.unmappedExternalCategory.findFirst({
      where: {
        supplierId: supplierId,
        externalCategory: fakeCategory
      }
    });
    console.log(`🔍 Catégorie sauvegardée:`, savedCategory);
    */
    console.log(`📝 Catégorie non mappée détectée: ${fakeCategory} (temporairement désactivé)`);
    
    // Fallback: première catégorie disponible
    const firstCategory = await this.prisma.category.findFirst();
    if (!firstCategory) {
      throw new Error('Aucune catégorie trouvée dans la base de données');
    }
    console.log(`🔄 Utilisation de la catégorie par défaut: ${firstCategory.name} (ID: ${firstCategory.id})`);
    return firstCategory.id;
  }

  private generateBadge(): string | null {
    const badges = ['promo', 'nouveau', 'tendances', 'top-ventes', null];
    return badges[Math.floor(Math.random() * badges.length)];
  }
}
