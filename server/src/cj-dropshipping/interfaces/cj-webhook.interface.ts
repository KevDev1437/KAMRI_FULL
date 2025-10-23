export interface CJWebhookPayload {
  messageId: string;
  type: 'PRODUCT' | 'VARIANT' | 'STOCK' | 'ORDER' | 'LOGISTIC' | 'SOURCINGCREATE' | 'ORDERSPLIT';
  params: any;
}