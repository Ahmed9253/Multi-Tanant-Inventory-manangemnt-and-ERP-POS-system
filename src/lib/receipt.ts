type ReceiptItem = { name: string; quantity: number; price: number };

type ReceiptData = {
  number: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: string;
  branch?: string;
  storeName: string;
  currency: string;
};

export function printReceipt(order: ReceiptData): void {
  const win = window.open("", "_blank", "width=420,height=640");
  if (!win) return;
  const c = order.currency;
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${item.quantity}× ${item.name}</td><td class="r">${c}${(item.price * item.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><title>Receipt #${String(order.number).padStart(4, "0")}</title>
    <style>
      *{box-sizing:border-box}
      body{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;padding:24px;color:#143f35;margin:0}
      h1{font-size:18px;margin:0 0 4px}
      .muted{color:#777b75;font-size:11px}
      hr{border:0;border-top:1px dashed #b7b9af;margin:12px 0}
      table{width:100%;border-collapse:collapse}
      td{padding:3px 0}
      .r{text-align:right}
      .tot{border-top:1px solid #143f35;margin-top:8px;padding-top:8px;font-weight:bold;font-size:15px}
      .center{text-align:center}
    </style></head><body>
    <h1>${order.storeName}</h1>
    <p class="muted">${order.branch || ""}</p>
    <hr>
    <p>Order #${String(order.number).padStart(4, "0")}</p>
    <p class="muted">${new Date().toLocaleString()}</p>
    <hr>
    <table>${rows}</table>
    <hr>
    <div>Subtotal: ${c}${order.subtotal.toFixed(2)}</div>
    ${order.discount > 0 ? `<div>Discount: -${c}${order.discount.toFixed(2)}</div>` : ""}
    <div>Tax: ${c}${order.tax.toFixed(2)}</div>
    <div class="tot">Total: ${c}${order.total.toFixed(2)}</div>
    <p class="muted">Paid via ${order.payment}</p>
    <hr>
    <p class="center muted">Thank you for your order!</p>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
