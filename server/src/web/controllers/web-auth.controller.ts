import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';

@ApiTags('Web Auth')
@Controller('api/web/auth')
@UseGuards(PlatformGuard)
@Platform('web')
export class WebAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly platformService: PlatformService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Web user login (optimized)' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async login(
    @Body() body: { email: string; password: string },
    @Headers('user-agent') userAgent: string,
    @Headers('x-platform') platform: string,
  ) {
    // TODO: Implémenter l'authentification réelle avec Supabase
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      return this.platformService.createWebResponse(
        { error: 'Invalid credentials' },
        { error: true }
      );
    }

    // Optimisations spécifiques web
    const webUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      // Données enrichies pour web
      avatar: null,
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'fr',
        currency: 'EUR',
      },
      permissions: ['read', 'write'],
      lastLogin: new Date().toISOString(),
    };

    return this.platformService.createWebResponse(webUser, {
      cache: { ttl: 7200, key: `web_user_${user.id}` }
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Web user registration (optimized)' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async register(
    @Body() body: { email: string; name: string; password: string },
    @Headers('user-agent') userAgent: string,
  ) {
    // TODO: Implémenter l'inscription réelle
    const user = await this.authService.createUser(body.email, body.name);
    
    return this.platformService.createWebResponse(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        message: 'Account created successfully',
        verificationRequired: true,
      },
      { cache: { ttl: 7200, key: `web_user_${user.id}` } }
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Web user logout' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async logout(@Headers('user-agent') userAgent: string) {
    // TODO: Implémenter la déconnexion
    return this.platformService.createWebResponse(
      { message: 'Logged out successfully' },
      { cache: { ttl: 0, key: 'web_logout' } }
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Web password reset request' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async forgotPassword(
    @Body() body: { email: string },
    @Headers('user-agent') userAgent: string,
  ) {
    // TODO: Implémenter la réinitialisation de mot de passe
    return this.platformService.createWebResponse(
      { 
        message: 'Password reset email sent',
        emailSent: true 
      },
      { cache: { ttl: 300, key: `web_password_reset_${body.email}` } }
    );
  }
}
