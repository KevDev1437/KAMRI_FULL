import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from '../../cart/cart.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';

@ApiTags('Mobile Cart')
@Controller('api/mobile/cart')
@UseGuards(PlatformGuard)
@Platform('mobile')
export class MobileCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items optimized for mobile' })
  async getCartItems() {
    // TODO: Implémenter la récupération du panier
    return this.platformService.createMobileResponse([], {
      cache: { ttl: 300, key: 'mobile_cart' }
    });
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Body() body: { productId: string; quantity: number }) {
    // TODO: Implémenter l'ajout au panier
    return this.platformService.createMobileResponse({ success: true }, {
      cache: { ttl: 0, key: 'mobile_cart' }
    });
  }
}
