import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FakeStoreUsersSyncService } from '../services/fake-store-users-sync.service';
import { FakeStoreUsersService } from '../services/fake-store-users.service';

@ApiTags('Dashboard - Fake Store Users')
@Controller('api/dashboard/fake-store/users')
// @UseGuards(JwtAuthGuard) // Temporairement désactivé pour les tests
export class FakeStoreUsersController {
  constructor(
    private readonly fakeStoreUsers: FakeStoreUsersService,
    private readonly fakeStoreUsersSync: FakeStoreUsersSyncService,
  ) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test connection to Fake Store Users API' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    const success = await this.fakeStoreUsers.testConnection();
    return { 
      success, 
      message: success ? 'Fake Store Users API connection successful' : 'Fake Store Users API connection failed' 
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users from Fake Store API' })
  @ApiResponse({ status: 200, description: 'List of users from Fake Store API' })
  async getUsers() {
    return this.fakeStoreUsers.getAllUsers();
  }

  @Get('count')
  @ApiOperation({ summary: 'Get users count from Fake Store API' })
  @ApiResponse({ status: 200, description: 'Users count from Fake Store API' })
  async getUsersCount() {
    const count = await this.fakeStoreUsers.getUsersCount();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user from Fake Store API' })
  @ApiResponse({ status: 200, description: 'User details from Fake Store API' })
  async getUserById(@Param('id') id: string) {
    return this.fakeStoreUsers.getUserById(parseInt(id));
  }

  @Post('sync/all')
  @ApiOperation({ summary: 'Synchronize all users from Fake Store API to local database' })
  @ApiResponse({ status: 201, description: 'Synchronization result' })
  async syncAllUsers() {
    return this.fakeStoreUsersSync.syncAllUsers();
  }

  @Get('local/stats')
  @ApiOperation({ summary: 'Get statistics about Fake Store users in local database' })
  @ApiResponse({ status: 200, description: 'Statistics data' })
  async getStats() {
    return this.fakeStoreUsersSync.getStats();
  }

  @Get('local/all')
  @ApiOperation({ summary: 'Get all synchronized users from local database' })
  @ApiResponse({ status: 200, description: 'List of synchronized users' })
  async getAllLocalUsers() {
    return this.fakeStoreUsersSync.getAllUsers();
  }

  @Get('local/:id')
  @ApiOperation({ summary: 'Get a specific synchronized user from local database' })
  @ApiResponse({ status: 200, description: 'Synchronized user details' })
  async getLocalUserById(@Param('id') id: string) {
    return this.fakeStoreUsersSync.getUserById(id);
  }
}
