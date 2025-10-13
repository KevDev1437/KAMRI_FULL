import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Auth Test')
@Controller('api/auth-test')
export class AuthTestController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('login')
  @ApiOperation({ summary: 'Test login with any user' })
  @ApiResponse({ status: 200, description: 'Login test result' })
  async testLogin(@Body() loginData: { email: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          createdAt: true,
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
        message: 'Connexion réussie (test)',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username || user.email.split('@')[0]
        },
        token: 'test-token-' + user.id
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion',
        error: (error as Error).message
      };
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users for login testing' })
  @ApiResponse({ status: 200, description: 'List of users available for login' })
  async getUsersForLogin() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
        },
        take: 10
      });

      return {
        success: true,
        message: 'Utilisateurs disponibles pour la connexion',
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username || user.email.split('@')[0]
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
        error: (error as Error).message
      };
    }
  }
}
