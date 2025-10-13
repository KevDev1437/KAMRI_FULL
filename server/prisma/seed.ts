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

  // Create products
  const products = [];
  for (let i = 1; i <= 200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = Math.random() * 500 + 10; // Random price between $10-$510
    
    products.push({
      name: `Product ${i}`,
      description: `This is a great product number ${i} with amazing features.`,
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
      image: `https://picsum.photos/400/300?random=${i}`,
      categoryId: category.id,
    });
  }

  await prisma.product.createMany({
    data: products,
  });

  console.log('✅ Products created');

  // Create a sample user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('✅ Sample user created');

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

