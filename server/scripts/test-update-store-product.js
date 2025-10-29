// Quick smoke test to update a CJ store product via Prisma (no HTTP server required)
// Usage: pnpm --filter server run test:update-store

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const product = await prisma.cJProductStore.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!product) {
      console.log('Aucun produit CJ dans le magasin.');
      return;
    }

    console.log('Produit avant mise à jour:\n', {
      id: product.id,
      name: product.name,
      isFavorite: product.isFavorite,
      status: product.status,
    });

    const updated = await prisma.cJProductStore.update({
      where: { id: product.id },
      data: {
        name: product.name.endsWith(' [EDIT]') ? product.name.replace(/ \[EDIT\]$/,'') : product.name + ' [EDIT]',
        isFavorite: !product.isFavorite,
        tags: JSON.stringify(['custom', 'edited']),
        variants: product.variants || JSON.stringify([]),
      },
    });

    console.log('\nProduit après mise à jour:\n', {
      id: updated.id,
      name: updated.name,
      isFavorite: updated.isFavorite,
      status: updated.status,
    });
  } catch (e) {
    console.error('Erreur du test de mise à jour:', e);
  } finally {
    // Ensure we always disconnect
    await prisma.$disconnect();
  }
}

main();
