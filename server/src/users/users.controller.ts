import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      data: users,
      message: 'Utilisateurs récupérés avec succès'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return {
        error: 'Utilisateur non trouvé'
      };
    }
    return {
      data: user,
      message: 'Utilisateur récupéré avec succès'
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(@Param('id') id: string, @Body() userData: any) {
    const user = await this.usersService.update(id, userData);
    if (!user) {
      return {
        error: 'Utilisateur non trouvé'
      };
    }
    return {
      data: user,
      message: 'Utilisateur modifié avec succès'
    };
  }
}
