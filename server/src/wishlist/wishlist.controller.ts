import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@Controller('api/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user wishlist' })
  getWishlist(@Param('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to wishlist' })
  addToWishlist(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':userId/:productId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  removeFromWishlist(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Clear user wishlist' })
  clearWishlist(@Param('userId') userId: string) {
    return this.wishlistService.clearWishlist(userId);
  }
}
