import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() body: { email: string; password: string }) {
    // TODO: Implement proper authentication
    return { message: 'Login endpoint - to be implemented with Supabase' };
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  register(@Body() body: { email: string; name: string }) {
    return this.authService.createUser(body.email, body.name);
  }
}

