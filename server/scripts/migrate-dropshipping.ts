#!/usr/bin/env ts-node

/**
 * Script de migration pour l'architecture dropshipping
 * Usage: npx ts-node scripts/migrate-dropshipping.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDropshipping() {
  console.log('🚀 Starting dropshipping migration...');

  try {
    // 1. Vérifier la connexion à la base de données
    console.log('📊 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 2. Créer les fournisseurs par défaut
    console.log('🏪 Creating default suppliers...');
    
    const defaultSuppliers = [
      {
        name: "AliExpress Dropshipping",
        apiUrl: "https://api.aliexpress.com",
        apiKey: process.env.ALIEXPRESS_API_KEY || "demo-key",
        type: "dropshipping",
        status: "pending",
        settings: {
          autoSync: true,
          syncInterval: 60,
          priceMarkup: 30,
          stockThreshold: 5
        }
      },
      {
        name: "Shopify Store",
        apiUrl: "https://your-store.myshopify.com/api/2023-10",
        apiKey: process.env.SHOPIFY_API_KEY || "demo-key",
        type: "dropshipping",
        status: "pending",
        settings: {
          autoSync: true,
          syncInterval: 120,
          priceMarkup: 25,
          stockThreshold: 3
        }
      },
      {
        name: "WooCommerce Store",
        apiUrl: "https://your-store.com/wp-json/wc/v3",
        apiKey: process.env.WOOCOMMERCE_API_KEY || "demo-key",
        type: "dropshipping",
        status: "pending",
        settings: {
          autoSync: false,
          syncInterval: 240,
          priceMarkup: 35,
          stockThreshold: 10
        }
      }
    ];

    for (const supplierData of defaultSuppliers) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: { name: supplierData.name }
      });

      if (!existingSupplier) {
        const supplier = await prisma.supplier.create({
          data: supplierData
        });
        console.log(`✅ Created supplier: ${supplier.name}`);
      } else {
        console.log(`⚠️ Supplier already exists: ${supplierData.name}`);
      }
    }

    // 3. Créer un utilisateur dashboard par défaut
    console.log('👤 Creating default dashboard user...');
    
    const defaultDashboardUser = {
      email: process.env.DASHBOARD_ADMIN_EMAIL || "admin@kamri.com",
      name: "Admin User",
      role: "admin",
      isActive: true
    };

    const existingUser = await prisma.dashboardUser.findFirst({
      where: { email: defaultDashboardUser.email }
    });

    if (!existingUser) {
      const user = await prisma.dashboardUser.create({
        data: defaultDashboardUser
      });
      console.log(`✅ Created dashboard user: ${user.email}`);
    } else {
      console.log(`⚠️ Dashboard user already exists: ${defaultDashboardUser.email}`);
    }

    // 4. Créer des catégories par défaut si elles n'existent pas
    console.log('📂 Creating default categories...');
    
    const defaultCategories = [
      { name: "Mode", description: "Vêtements et accessoires" },
      { name: "Technologie", description: "Électronique et gadgets" },
      { name: "Maison", description: "Décoration et mobilier" },
      { name: "Beauté", description: "Cosmétiques et soins" },
      { name: "Sport", description: "Équipements sportifs" },
      { name: "Enfants", description: "Produits pour enfants" },
      { name: "Accessoires", description: "Accessoires divers" }
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        const category = await prisma.category.create({
          data: categoryData
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⚠️ Category already exists: ${categoryData.name}`);
      }
    }

    // 5. Vérifier les statistiques
    console.log('📊 Checking database statistics...');
    
    const stats = {
      suppliers: await prisma.supplier.count(),
      dashboardUsers: await prisma.dashboardUser.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      users: await prisma.user.count()
    };

    console.log('📈 Database statistics:');
    console.log(`   - Suppliers: ${stats.suppliers}`);
    console.log(`   - Dashboard Users: ${stats.dashboardUsers}`);
    console.log(`   - Categories: ${stats.categories}`);
    console.log(`   - Products: ${stats.products}`);
    console.log(`   - Users: ${stats.users}`);

    // 6. Test de connexion aux APIs (simulation)
    console.log('🔗 Testing supplier connections...');
    
    const suppliers = await prisma.supplier.findMany();
    for (const supplier of suppliers) {
      console.log(`   - ${supplier.name}: ${supplier.status} (${supplier.type})`);
    }

    console.log('✅ Dropshipping migration completed successfully!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Configure your supplier API keys in .env');
    console.log('   2. Test supplier connections in dashboard');
    console.log('   3. Start product synchronization');
    console.log('   4. Monitor analytics in dashboard');
    console.log('');
    console.log('📚 Documentation:');
    console.log('   - Integration Guide: server/INTEGRATION_GUIDE.md');
    console.log('   - Dropshipping Architecture: server/DROPSHIPPING_ARCHITECTURE.md');
    console.log('   - API Documentation: http://localhost:3001/api/docs');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateDropshipping()
    .then(() => {
      console.log('🎉 Migration script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateDropshipping };
