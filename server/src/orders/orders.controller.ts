import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  createOrder(@GetUser() user: any, @Body() body: { items: any[] }) {
    return this.ordersService.createOrder(user.userId, body.items);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  getUserOrders(@GetUser() user: any) {
    return this.ordersService.getUserOrders(user.userId);
  }

  @Get('order/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}

