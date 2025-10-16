import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const wishlist = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: wishlist,
      message: 'Wishlist récupérée avec succès',
    };
  }

  async addToWishlist(userId: string, productId: string) {
    // Vérifier si le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si le produit est déjà dans les favoris
    const existingWishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingWishlistItem) {
      return {
        data: existingWishlistItem,
        message: 'Produit déjà dans les favoris',
      };
    }

    // Ajouter à la wishlist
    const wishlistItem = await this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
            images: true,
          },
        },
      },
    });

    return {
      data: wishlistItem,
      message: 'Produit ajouté aux favoris',
    };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const deletedItem = await this.prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return {
      data: { deletedCount: deletedItem.count },
      message: 'Produit supprimé des favoris',
    };
  }

  async clearWishlist(userId: string) {
    const deletedItems = await this.prisma.wishlist.deleteMany({
      where: { userId },
    });

    return {
      data: { deletedCount: deletedItems.count },
      message: 'Wishlist vidée',
    };
  }
}
