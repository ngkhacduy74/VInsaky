import * as crypto from 'crypto';

export function sepaySignature(secretKey: string, fields: Record<string, any>) {
  const keys = [
    'merchant',
    'operation',
    'payment_method',
    'order_amount',
    'currency',
    'order_invoice_number',
    'order_description',
    'customer_id',
    'success_url',
    'error_url',
    'cancel_url',
  ];

  const signedString = keys.map((k) => `${k}=${fields[k] ?? ''}`).join(',');
  return crypto.createHmac('sha256', secretKey).update(signedString).digest('base64');
}