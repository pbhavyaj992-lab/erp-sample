export type Product = { id: string; tenant_id: string; sku: string; name: string; unit: string; cost_inr: number; price_inr: number; reorder_level: number; created_at: string };
export type StockRow = { product_id: string; location: string; quantity: number };
export type Supplier = { id: string; tenant_id: string; name: string; email: string | null; phone: string | null; gstin: string | null };
export type PurchaseOrder = { id: string; tenant_id: string; po_number: string; supplier_id: string | null; status: "draft" | "ordered" | "received" | "cancelled"; total_inr: number; ordered_at: string };
export type SalesOrder = { id: string; tenant_id: string; so_number: string; customer_name: string; status: "draft" | "confirmed" | "shipped" | "delivered" | "cancelled"; total_inr: number; ordered_at: string };
export type Invoice = { id: string; tenant_id: string; invoice_number: string; sales_order_id: string | null; amount_inr: number; status: "unpaid" | "partially_paid" | "paid" | "overdue"; due_date: string | null; created_at: string };
export type Payment = { id: string; tenant_id: string; invoice_id: string | null; amount_inr: number; method: string | null; paid_at: string };
export type StockMovement = { id: string; tenant_id: string; product_id: string; location: string; change_qty: number; reason: string; created_at: string };
// Scope note: this is a deliberately narrow ERP slice — inventory,
// purchasing, sales and basic finance only. No HR, payroll, manufacturing
// (MRP), CRM or GST filing. See README for the boundary.
