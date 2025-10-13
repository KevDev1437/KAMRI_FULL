import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // TODO: Ajouter des données de test réelles quand nécessaire
  // Pour l'instant, on garde la base de données vide pour développer l'API

  console.log('🎉 Database ready for development!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

