import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clothing',
        description: 'Fashion and apparel',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        description: 'Books and literature',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Garden',
        description: 'Home improvement and gardening',
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

