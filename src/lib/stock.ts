// Stock math lives in one place so the UI, the seed and any future
// server action agree. Stock on hand = sum(stock_movements.change_qty)
// per product/location. A sale must never drive stock below zero in a
// real deployment — the database trigger in schema.sql enforces that
// for sales-order fulfilment; the UI also blocks negative adjustments.
export function stockStatus(qty: number, reorderLevel: number) {
  if (qty <= 0) return "out_of_stock";
  if (qty <= reorderLevel) return "low_stock";
  return "in_stock";
}
export function orderTotal(lines: { qty: number; unitPrice: number }[]) {
  return lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
}
