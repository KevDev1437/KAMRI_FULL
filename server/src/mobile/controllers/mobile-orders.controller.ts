import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';
import { OrdersService } from '../../orders/orders.service';

@ApiTags('Mobile Orders')
@Controller('api/mobile/orders')
@UseGuards(PlatformGuard)
@Platform('mobile')
export class MobileOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get orders optimized for mobile' })
  async getOrders() {
    // TODO: Implémenter la récupération des commandes
    return this.platformService.createMobileResponse([], {
      cache: { ttl: 300, key: 'mobile_orders' }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrderById(@Param('id') id: string) {
    // TODO: Implémenter la récupération d'une commande
    return this.platformService.createMobileResponse({}, {
      cache: { ttl: 300, key: `mobile_order_${id}` }
    });
  }
}
