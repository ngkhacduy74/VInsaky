const crypto = require('crypto');
function sign(secret, data) {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.map((k) => `${k}=${data[k]}`).join('&');
  return crypto.createHmac('sha256', secret).update(sortedData).digest('hex');
}
const secret = 'spsk_live_66Y1XybD4Gr15KdEpP4E7475ox3167D8';
const payload = {
  merchant: 'SP-LIVE-NK727677',
  currency: 'VND',
  order_amount: 50000,
  operation: 'PURCHASE',
  order_description: 'Test API',
  order_invoice_number: 'INV-' + Date.now(),
  payment_method: 'BANK_TRANSFER',
  customer_id: 'GUEST',
  email: 'test@example.com',
  success_url: 'https://vinsaky-fe.onrender.com/payment/success',
  error_url: 'https://vinsaky-fe.onrender.com/payment/error',
  cancel_url: 'https://vinsaky-fe.onrender.com/payment/cancel'
};
payload.signature = sign(secret, payload);

fetch('https://pay.sepay.vn/v1/checkout/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(async r => {
  const text = await r.text();
  try {
    console.log({ status: r.status, data: JSON.parse(text) });
  } catch(e) {
    console.log({ status: r.status, data: text });
  }
})
.catch(console.error);
