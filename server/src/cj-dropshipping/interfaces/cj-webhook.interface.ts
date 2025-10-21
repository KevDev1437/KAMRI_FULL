export interface CJWebhookPayload {
  messageId: string;
  type: 'PRODUCT' | 'STOCK' | 'ORDER' | 'LOGISTICS';
  params: any;
}