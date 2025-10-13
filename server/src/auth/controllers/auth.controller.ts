import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginData: { email: string; password?: string }) {
    try {
      // Pour l'instant, on accepte n'importe quel mot de passe pour les utilisateurs Fake Store
      const user = await this.authService.validateUser(loginData.email, loginData.password || 'fake-store-user');
      
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur non trouvé',
          user: null
        };
      }

      // Créer un token JWT simple (pour l'instant, on retourne juste les infos utilisateur)
      return {
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username || user.email.split('@')[0]
        },
        token: 'fake-jwt-token-' + user.id // Token simple pour l'instant
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion',
        error: (error as Error).message
      };
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  async getCurrentUser() {
    // Pour l'instant, on retourne une réponse simple
    return {
      success: true,
      message: 'User info retrieved'
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerData: { email: string; name: string; username?: string }) {
    try {
      const user = await this.authService.createUser(
        registerData.email, 
        registerData.name, 
        registerData.username
      );
      
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur',
        error: (error as Error).message
      };
    }
  }
}
