import * as crypto from 'crypto';

export function sepaySignature(secretKey: string, fields: Record<string, any>) {
  const allowed = new Set([
    'merchant','operation','payment_method','order_amount','currency',
    'order_invoice_number','order_description','customer_id',
    'success_url','error_url','cancel_url',
  ]);

  const signedString = Object.keys(fields)
    .filter((k) => allowed.has(k) && fields[k] !== undefined)
    .map((k) => `${k}=${fields[k] ?? ''}`)
    .join(',');

  return crypto.createHmac('sha256', secretKey).update(signedString, 'utf8').digest('base64');
}