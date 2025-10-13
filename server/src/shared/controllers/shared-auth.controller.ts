import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { PlatformService } from '../../common/services/platform.service';

@ApiTags('Shared Auth')
@Controller('api/shared/auth')
export class SharedAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly platformService: PlatformService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login (auto-detect platform)' })
  async login(
    @Body() body: { email: string; password: string },
    @Headers('user-agent') userAgent: string,
  ) {
    const platform = this.platformService.detectPlatform(userAgent);
    
    // TODO: Implémenter l'authentification réelle
    return this.platformService.createSharedResponse(
      { message: 'Login endpoint - to be implemented' },
      platform
    );
  }

  @Post('register')
  @ApiOperation({ summary: 'Register (auto-detect platform)' })
  async register(
    @Body() body: { email: string; name: string; password: string },
    @Headers('user-agent') userAgent: string,
  ) {
    const platform = this.platformService.detectPlatform(userAgent);
    
    // TODO: Implémenter l'inscription réelle
    return this.platformService.createSharedResponse(
      { message: 'Register endpoint - to be implemented' },
      platform
    );
  }
}
