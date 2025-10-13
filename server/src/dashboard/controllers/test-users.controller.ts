import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Test Users')
@Controller('api/test/users')
export class TestUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('count')
  @ApiOperation({ summary: 'Get total user count' })
  @ApiResponse({ status: 200, description: 'User count' })
  async getUserCount() {
    try {
      const count = await this.prisma.user.count();
      return { count, message: 'Success' };
    } catch (error) {
      return { 
        count: 0, 
        message: 'Error', 
        error: (error as Error).message 
      };
    }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users (simple)' })
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
        take: 5,
      });
      return { users, message: 'Success' };
    } catch (error) {
      return { 
        users: [], 
        message: 'Error', 
        error: (error as Error).message 
      };
    }
  }
}
