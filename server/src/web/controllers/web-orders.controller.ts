import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Platform } from '../../common/decorators/platform.decorator';
import { PlatformGuard } from '../../common/guards/platform.guard';
import { PlatformService } from '../../common/services/platform.service';
import { OrdersService } from '../../orders/orders.service';

@ApiTags('Web Orders')
@Controller('api/web/orders')
@UseGuards(PlatformGuard)
@Platform('web')
export class WebOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get orders optimized for web' })
  async getOrders() {
    // TODO: Implémenter la récupération des commandes
    return this.platformService.createWebResponse([], {
      cache: { ttl: 600, key: 'web_orders' }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrderById(@Param('id') id: string) {
    // TODO: Implémenter la récupération d'une commande
    return this.platformService.createWebResponse({}, {
      cache: { ttl: 300, key: `web_order_${id}` }
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async createOrder(@Body() body: any) {
    // TODO: Implémenter la création de commande
    return this.platformService.createWebResponse({ success: true }, {
      cache: { ttl: 0, key: 'web_orders' }
    });
  }
}
