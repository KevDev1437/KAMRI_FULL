export interface CJOrder {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  shippingAddress: CJShippingAddress;
  products: CJOrderProduct[];
  trackNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CJOrderProduct {
  vid: string;
  quantity: number;
  price: number;
  productName: string;
  variantInfo: string;
}

export interface CJShippingAddress {
  country: string;
  countryCode: string;
  province?: string;
  city: string;
  address: string;
  customerName: string;
  phone: string;
  zipCode?: string;
}

export interface CJOrderListResult {
  list: CJOrder[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface CJOrderCreateResult {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  message: string;
}

