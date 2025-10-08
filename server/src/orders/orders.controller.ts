import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  createOrder(@Body() body: { userId: string; items: any[] }) {
    return this.ordersService.createOrder(body.userId, body.items);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user orders' })
  getOrders(@Param('userId') userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @Get('order/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}

