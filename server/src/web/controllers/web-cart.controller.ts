import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from '../../cart/cart.service';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';

@ApiTags('Web Cart')
@Controller('api/web/cart')
@UseGuards(PlatformGuard)
@Platform('web')
export class WebCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items optimized for web' })
  async getCartItems() {
    // TODO: Implémenter la récupération du panier
    return this.platformService.createWebResponse([], {
      cache: { ttl: 300, key: 'web_cart' }
    });
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Body() body: { productId: string; quantity: number }) {
    // TODO: Implémenter l'ajout au panier
    return this.platformService.createWebResponse({ success: true }, {
      cache: { ttl: 0, key: 'web_cart' }
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateCartItem(@Param('id') id: string, @Body() body: { quantity: number }) {
    // TODO: Implémenter la mise à jour du panier
    return this.platformService.createWebResponse({ success: true }, {
      cache: { ttl: 0, key: 'web_cart' }
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(@Param('id') id: string) {
    // TODO: Implémenter la suppression du panier
    return this.platformService.createWebResponse({ success: true }, {
      cache: { ttl: 0, key: 'web_cart' }
    });
  }
}
