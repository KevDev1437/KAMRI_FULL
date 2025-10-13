import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnificationService } from '../services/unification.service';

@ApiTags('System Unification')
@Controller('api/unify')
export class UnificationController {
  constructor(private readonly unificationService: UnificationService) {}

  @Post('system')
  @ApiOperation({ summary: 'Unifie complètement le système de catégorisation' })
  @ApiResponse({ status: 200, description: 'Système unifié avec succès' })
  async unifySystem() {
    return this.unificationService.unifySystem();
  }

  @Get('check')
  @ApiOperation({ summary: 'Vérifie la cohérence du système' })
  @ApiResponse({ status: 200, description: 'État de cohérence du système' })
  async checkConsistency() {
    return this.unificationService.checkConsistency();
  }
}
