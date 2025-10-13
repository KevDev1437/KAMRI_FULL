import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Simple Users')
@Controller('api/simple/users')
export class SimpleUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (simple version)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return {
        success: true,
        count: users.length,
        users: users,
        message: `Found ${users.length} users`
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        users: [],
        message: 'Error fetching users',
        error: (error as Error).message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics' })
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
        success: true,
        totalUsers,
        activeUsers: totalUsers,
        recentUsers,
        message: 'Statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        totalUsers: 0,
        activeUsers: 0,
        recentUsers: [],
        message: 'Error fetching statistics',
        error: (error as Error).message
      };
    }
  }
}
