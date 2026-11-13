-- ERP Sample — DEMO / SAMPLE DATA ONLY. Fictional business "Acme Demo Traders".
-- No real customers, suppliers or transactions. Run after schema.sql.
insert into public.tenants (id, name, slug) values
  ('22222222-2222-2222-2222-222222222222', 'Acme Demo Traders', 'acme-demo-erp')
  on conflict (id) do nothing;
insert into public.products (id, tenant_id, sku, name, unit, cost_inr, price_inr, reorder_level) values
  ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'DEMO-VALVE-01', 'Demo Brass Valve 25mm', 'pcs', 420, 650, 20),
  ('a0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'DEMO-PIPE-02', 'Demo CNG Pipe 1m', 'm', 180, 290, 50),
  ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'DEMO-GAUGE-03', 'Demo Pressure Gauge', 'pcs', 310, 520, 10),
  ('a0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'DEMO-SEAL-04', 'Demo Seal Kit', 'pcs', 45, 90, 100)
  on conflict (tenant_id, sku) do nothing;
insert into public.suppliers (tenant_id, name, email, phone) values
  ('22222222-2222-2222-2222-222222222222', 'Demo Metals Suppliers', 'sales@example.in', '+91 90000 00011'),
  ('22222222-2222-2222-2222-222222222222', 'Demo Fittings House', 'orders@example.in', '+91 90000 00012');
-- Opening stock: positive movements only, so the negative-stock trigger is not hit.
insert into public.stock_movements (tenant_id, product_id, location, change_qty, reason) values
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'Main Store', 120, 'opening stock'),
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000002', 'Main Store', 45, 'opening stock'),
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000003', 'Main Store', 8, 'opening stock'),
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000004', 'Main Store', 300, 'opening stock'),
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000002', 'Main Store', -10, 'sample sale issue');
insert into public.purchase_orders (tenant_id, po_number, status, total_inr, ordered_at) values
  ('22222222-2222-2222-2222-222222222222', 'PO-2026-1001', 'ordered', 42000, now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'PO-2026-1002', 'received', 18500, now() - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'PO-2026-1003', 'draft', 9600, now() - interval '1 day');
insert into public.sales_orders (id, tenant_id, so_number, customer_name, status, total_inr, ordered_at) values
  ('b0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'SO-2026-2001', 'Demo Auto Works', 'delivered', 32500, now() - interval '6 days'),
  ('b0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'SO-2026-2002', 'Demo Gas Services', 'shipped', 17400, now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'SO-2026-2003', 'Demo Fleet Care', 'confirmed', 5200, now() - interval '1 day');
insert into public.sales_order_items (tenant_id, sales_order_id, product_id, qty, unit_price_inr) values
  ('22222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 50, 650),
  ('22222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 60, 290),
  ('22222222-2222-2222-2222-222222222222', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 10, 520);
insert into public.invoices (id, tenant_id, invoice_number, sales_order_id, amount_inr, status, due_date) values
  ('c0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'INV-2026-3001', 'b0000000-0000-0000-0000-000000000001', 32500, 'paid', current_date - 1),
  ('c0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'INV-2026-3002', 'b0000000-0000-0000-0000-000000000002', 17400, 'unpaid', current_date + 14),
  ('c0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'INV-2026-3003', 'b0000000-0000-0000-0000-000000000003', 5200, 'unpaid', current_date + 21);
insert into public.payments (tenant_id, invoice_id, amount_inr, method, paid_at) values
  ('22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000001', 32500, 'bank transfer', now() - interval '2 days');
