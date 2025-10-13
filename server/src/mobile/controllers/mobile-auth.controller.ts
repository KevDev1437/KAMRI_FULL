import { Body, Controller, Post, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { PlatformService } from '../../common/services/platform.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';

@ApiTags('Mobile Auth')
@Controller('api/mobile/auth')
@UseGuards(PlatformGuard)
@Platform('mobile')
export class MobileAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly platformService: PlatformService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Mobile user login (optimized)' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async login(
    @Body() body: { email: string; password: string },
    @Headers('user-agent') userAgent: string,
    @Headers('x-platform') platform: string,
  ) {
    // TODO: Implémenter l'authentification réelle avec Supabase
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      return this.platformService.createMobileResponse(
        { error: 'Invalid credentials' },
        { error: true }
      );
    }

    // Optimisations spécifiques mobile
    const mobileUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      // Données optimisées pour mobile
      avatar: null,
      preferences: {
        notifications: true,
        darkMode: false,
      }
    };

    return this.platformService.createMobileResponse(mobileUser, {
      cache: { ttl: 3600, key: `mobile_user_${user.id}` }
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Mobile user registration (optimized)' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async register(
    @Body() body: { email: string; name: string; password: string },
    @Headers('user-agent') userAgent: string,
  ) {
    // TODO: Implémenter l'inscription réelle
    const user = await this.authService.createUser(body.email, body.name);
    
    return this.platformService.createMobileResponse(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        message: 'Account created successfully'
      },
      { cache: { ttl: 3600, key: `mobile_user_${user.id}` } }
    );
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh mobile authentication token' })
  @ApiHeader({ name: 'x-platform', description: 'Platform identifier', required: true })
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Headers('user-agent') userAgent: string,
  ) {
    // TODO: Implémenter le refresh token
    return this.platformService.createMobileResponse(
      { 
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 3600
      },
      { cache: { ttl: 300, key: 'mobile_refresh_token' } }
    );
  }
}
