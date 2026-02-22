export class OrderItemResponseDto {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShippingResponseDto {
  fullName: string;
  phone: string;
  addressDetail: string;
  note?: string;
}

export class SepayResponseDto {
  orderInvoiceNumber: string;
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paidAt?: string; 
}

export class OrderResponseDto {
  id: string;
  user_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  total: number;

  shipping: ShippingResponseDto;
  items: OrderItemResponseDto[];

  sepay: SepayResponseDto;

  createdAt?: string;
  updatedAt?: string;
}