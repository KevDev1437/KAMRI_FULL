import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FakeStoreUsersService } from './fake-store-users.service';

@Injectable()
export class FakeStoreUsersSyncService {
  constructor(
    private prisma: PrismaService,
    private fakeStoreUsers: FakeStoreUsersService,
  ) {}

  async syncAllUsers(): Promise<any> {
    const users = await this.fakeStoreUsers.getAllUsers();
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    console.log(`🔄 [UsersSync] Synchronisation de ${users.length} utilisateurs...`);

    for (const user of users) {
      try {
        const existingUser = await this.prisma.user.findFirst({
          where: { 
            OR: [
              { email: user.email },
              { username: user.username }
            ]
          },
        });

        const userData = {
          email: user.email,
          username: user.username,
          name: user.name.firstname + ' ' + user.name.lastname,
        };

        if (existingUser) {
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: userData,
          });
          updatedCount++;
          console.log(`✅ [UsersSync] Utilisateur mis à jour: ${user.username}`);
        } else {
          await this.prisma.user.create({
            data: userData,
          });
          addedCount++;
          console.log(`✅ [UsersSync] Utilisateur ajouté: ${user.username}`);
        }
        } catch (e) {
          errors.push(`Failed to sync user ${user.username}: ${(e as Error).message}`);
          skippedCount++;
          console.error(`❌ [UsersSync] Erreur pour l'utilisateur ${user.username}:`, (e as Error).message);
        }
    }

    return {
      success: errors.length === 0,
      usersAdded: addedCount,
      usersUpdated: updatedCount,
      usersSkipped: skippedCount,
      errors,
      totalProcessed: users.length,
    };
  }

  async getStats() {
    try {
      const totalUsers = await this.prisma.user.count();
      
      const recentUsers = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      return {
        totalUsers,
        activeUsers: totalUsers, // Pour l'instant, tous les utilisateurs sont considérés comme actifs
        recentUsers,
      };
    } catch (error) {
      console.error('❌ [UsersSync] Erreur dans getStats:', (error as Error).message);
      throw error;
    }
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllUsers() {
    try {
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('❌ [UsersSync] Erreur dans getAllUsers:', (error as Error).message);
      throw error;
    }
  }
}
