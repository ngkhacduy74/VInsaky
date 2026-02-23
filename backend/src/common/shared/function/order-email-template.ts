export function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

export function orderPaidEmailHtml(order: any) {
  const items = order.items || [];
  const total = Number(order.total) || 0;

  const rows = items
    .map((it: any, idx: number) => {
      const name = it?.name ?? it?.productName ?? it?.title ?? 'Sản phẩm';
      const qty = Number(it?.quantity ?? it?.qty ?? 1);
      const price = Number(it?.price ?? it?.unitPrice ?? 0);
      const lineTotal = price * qty;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${idx + 1}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <div style="font-weight:600">${escapeHtml(name)}</div>
            ${it?.id ? `<div style="color:#777;font-size:12px">Mã: ${escapeHtml(String(it.id))}</div>` : ''}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${formatVnd(price)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${formatVnd(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  const shipping = order.shipping || {};
  const invoice = order.sepay?.orderInvoiceNumber ?? order.invoice ?? '';
  const paidAt = order.sepay?.paidAt ? new Date(order.sepay.paidAt) : new Date();

  return `
  <div style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,sans-serif">
    <div style="max-width:720px;margin:0 auto;padding:24px">
      <div style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06)">
        
        <div style="padding:22px 24px;background:linear-gradient(135deg,#111827,#2563eb);color:#fff">
          <div style="font-size:20px;font-weight:700">Hóa đơn thanh toán</div>
          <div style="margin-top:6px;font-size:13px;opacity:.9">
            Mã đơn: <b>${escapeHtml(String(invoice))}</b> • Trạng thái: <b>ĐÃ THANH TOÁN</b>
          </div>
        </div>

        <div style="padding:20px 24px">
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:260px;background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:14px">
              <div style="font-weight:700;margin-bottom:8px">Thông tin giao hàng</div>
              <div style="font-size:14px;line-height:1.6;color:#111827">
                <div><b>Họ tên:</b> ${escapeHtml(shipping.fullName ?? '')}</div>
                <div><b>SĐT:</b> ${escapeHtml(shipping.phone ?? '')}</div>
                ${shipping.email ? `<div><b>Email:</b> ${escapeHtml(shipping.email)}</div>` : ''}
                <div><b>Địa chỉ:</b> ${escapeHtml(shipping.addressDetail ?? '')}</div>
              </div>
            </div>

            <div style="flex:1;min-width:260px;background:#f9fafb;border:1px solid #eef2f7;border-radius:12px;padding:14px">
              <div style="font-weight:700;margin-bottom:8px">Chi tiết thanh toán</div>
              <div style="font-size:14px;line-height:1.6;color:#111827">
                <div><b>Thời gian:</b> ${escapeHtml(paidAt.toLocaleString('vi-VN'))}</div>
                <div><b>Phương thức:</b> Chuyển khoản</div>
                <div><b>Tổng thanh toán:</b> <span style="font-weight:800;color:#2563eb">${formatVnd(total)}</span></div>
              </div>
            </div>
          </div>

          <div style="margin-top:18px;font-weight:800;font-size:16px">Danh sách sản phẩm</div>
          <div style="margin-top:10px;border:1px solid #eef2f7;border-radius:12px;overflow:hidden">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead style="background:#f3f4f6">
                <tr>
                  <th style="padding:10px;text-align:left">#</th>
                  <th style="padding:10px;text-align:left">Sản phẩm</th>
                  <th style="padding:10px;text-align:center">SL</th>
                  <th style="padding:10px;text-align:right">Đơn giá</th>
                  <th style="padding:10px;text-align:right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="5" style="padding:14px;color:#777">Không có sản phẩm</td></tr>`}
              </tbody>
            </table>
          </div>

          <div style="margin-top:16px;display:flex;justify-content:flex-end">
            <div style="min-width:320px;background:#111827;color:#fff;border-radius:12px;padding:14px 16px">
              <div style="display:flex;justify-content:space-between;margin:6px 0;font-size:14px">
                <span>Tổng cộng</span>
                <b>${formatVnd(total)}</b>
              </div>
            </div>
          </div>

          <div style="margin-top:18px;color:#6b7280;font-size:12px;line-height:1.6">
            Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ bộ phận hỗ trợ và cung cấp mã đơn <b>${escapeHtml(String(invoice))}</b>.
          </div>
        </div>

      </div>

      <div style="text-align:center;margin-top:14px;color:#9ca3af;font-size:12px">
        Email này được gửi tự động, vui lòng không trả lời trực tiếp.
      </div>
    </div>
  </div>
  `;
}

function escapeHtml(input: string) {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}