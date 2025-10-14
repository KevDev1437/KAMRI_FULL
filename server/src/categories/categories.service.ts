import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            badge: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            status: 'active'
          }
        }
      }
    });
  }
}
