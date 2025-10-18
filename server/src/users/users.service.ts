import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            cart: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          }
        },
        addresses: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            isDefault: true
          }
        }
      }
    });
  }

  async update(id: string, data: { 
    name?: string; 
    email?: string; 
    firstName?: string; 
    lastName?: string; 
    phone?: string; 
    address?: string; 
    role?: string; 
    status?: string 
  }) {
    console.log('✏️ [UsersService] === DÉBUT DE LA MISE À JOUR ===');
    console.log('✏️ [UsersService] ID utilisateur:', id);
    console.log('✏️ [UsersService] Données reçues:', data);
    console.log('✏️ [UsersService] Type de données:', typeof data);
    console.log('✏️ [UsersService] Clés disponibles:', Object.keys(data));
    
    try {
      const result = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      console.log('✅ [UsersService] Utilisateur mis à jour avec succès:', result);
      console.log('✏️ [UsersService] === FIN DE LA MISE À JOUR ===');
      return result;
    } catch (error) {
      console.error('❌ [UsersService] Erreur lors de la mise à jour:', error);
      console.error('❌ [UsersService] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }
}
