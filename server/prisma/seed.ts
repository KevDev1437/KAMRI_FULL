import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories - 7 catégories fixes
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Mode',
        description: 'Vêtements et accessoires de mode',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Technologie',
        description: 'Électronique et gadgets technologiques',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Maison',
        description: 'Décoration et équipement de la maison',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beauté',
        description: 'Produits de beauté et soins',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessoires',
        description: 'Accessoires et petits objets',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sport',
        description: 'Équipement et vêtements de sport',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Enfants',
        description: 'Produits pour enfants et bébés',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Temu',
        description: 'Plateforme de dropshipping chinoise',
        apiUrl: 'https://api.temu.com',
        apiKey: 'temu_****_****',
        status: 'connected',
        lastSync: new Date(),
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'AliExpress',
        description: 'Marketplace international d\'AliExpress',
        apiUrl: 'https://api.aliexpress.com',
        apiKey: 'aliexpress_****_****',
        status: 'connected',
        lastSync: new Date(),
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Shein',
        description: 'Plateforme de mode rapide',
        apiUrl: 'https://api.shein.com',
        apiKey: 'shein_****_****',
        status: 'disconnected',
      },
    }),
  ]);

  console.log('✅ Suppliers created');

  // Create products with realistic data
  const productData = [
    {
      name: 'iPhone 15 Pro',
      description: 'Smartphone Apple dernier cri',
      price: 999.99,
      originalPrice: 1199.99,
      badge: 'promo',
      stock: 45,
      sales: 128,
      categoryId: categories[1].id, // Technologie
      supplierId: suppliers[0].id, // Temu
    },
    {
      name: 'Jean Slim Fit',
      description: 'Jean moderne et confortable',
      price: 59.99,
      badge: 'nouveau',
      stock: 23,
      sales: 89,
      categoryId: categories[0].id, // Mode
      supplierId: suppliers[1].id, // AliExpress
    },
    {
      name: 'Sac à Main Cuir',
      description: 'Sac en cuir véritable',
      price: 89.99,
      originalPrice: 129.99,
      badge: 'tendances',
      stock: 12,
      sales: 67,
      categoryId: categories[4].id, // Accessoires
      supplierId: suppliers[2].id, // Shein
    },
    {
      name: 'Laptop Gaming',
      description: 'Ordinateur portable pour gaming',
      price: 1299.99,
      badge: null,
      stock: 8,
      sales: 45,
      categoryId: categories[1].id, // Technologie
      supplierId: suppliers[0].id, // Temu
    },
    {
      name: 'Parfum Élégant',
      description: 'Parfum de luxe pour homme',
      price: 79.99,
      originalPrice: 99.99,
      badge: 'top-ventes',
      stock: 34,
      sales: 203,
      categoryId: categories[3].id, // Beauté
      supplierId: suppliers[1].id, // AliExpress
    },
  ];

  const products = await Promise.all(
    productData.map(data => prisma.product.create({ data }))
  );

  console.log('✅ Products created');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@kamri.com',
        name: 'Admin KAMRI',
        role: 'admin',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Utilisateur Test',
        role: 'user',
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Users created');

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[1].id,
        total: 299.97,
        status: 'processing',
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        total: 89.99,
        status: 'shipped',
      },
    }),
  ]);

  // Create order items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: products[0].price,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[1].id,
        quantity: 2,
        price: products[1].price,
      },
    }),
  ]);

  console.log('✅ Orders created');

  // Create category mappings
  await Promise.all([
    prisma.categoryMapping.create({
      data: {
        supplierId: suppliers[0].id,
        externalCategory: 'Electronics',
        internalCategory: 'Technologie',
        status: 'mapped',
      },
    }),
    prisma.categoryMapping.create({
      data: {
        supplierId: suppliers[1].id,
        externalCategory: 'Women\'s Clothing',
        internalCategory: 'Mode',
        status: 'mapped',
      },
    }),
  ]);

  console.log('✅ Category mappings created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

