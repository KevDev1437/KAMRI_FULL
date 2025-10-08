import { Body, Controller, Headers, Post, RawBody } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  createPaymentIntent(
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.paymentsService.createPaymentIntent(
      body.amount,
      body.currency,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  handleWebhook(
    @RawBody() payload: string,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}

