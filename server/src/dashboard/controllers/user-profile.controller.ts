import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('User Profile')
@Controller('api/user-profile')
export class UserProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  async getUserProfile(@Param('id') id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          user: null
        };
      }

      return {
        success: true,
        message: 'Profil utilisateur récupéré avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          memberSince: user.createdAt,
          lastUpdated: user.updatedAt,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: (error as Error).message,
        user: null
      };
    }
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get user profile by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  async getUserProfileByEmail(@Param('email') email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          user: null
        };
      }

      return {
        success: true,
        message: 'Profil utilisateur récupéré avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          memberSince: user.createdAt,
          lastUpdated: user.updatedAt,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: (error as Error).message,
        user: null
      };
    }
  }
}
