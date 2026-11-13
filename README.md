# ERP Sample — Next.js + Supabase (narrow slice, multi-tenant)

A sellable **sample** ERP slice built from scratch in TypeScript / React /
Next.js with Supabase (PostgreSQL + Auth + Row Level Security). Original
code only: module boundaries were studied at a high level from ERPNext /
Odoo module maps; no code was copied from them, from ISHAN Detailing OS,
or from any other product.

> **Status: sample / demo — not production-ready.** The four modules below
> are designed to run against a real Supabase project. Stock posting on PO
> receipt / SO shipment, GST, ledger accounting and payroll are not built
> (see "Not yet implemented"). All seed data is fictional demo data.

## Scope — deliberately narrow (4 modules only)

| Module | What works |
| --- | --- |
| Dashboard (`/`) | Product count and low-stock count, open PO value, unpaid invoices, latest sales orders and invoices |
| Inventory (`/inventory`) | Products with SKU, cost/price and reorder level; on-hand stock derived from `stock_movements`; stock status (in stock / low stock / out of stock); record a receipt or issue as a movement row — stock is never edited directly |
| Purchase orders (`/purchase-orders`) | Create a PO (draft), move draft → ordered → received / cancelled; suppliers table in the schema |
| Sales orders (`/sales-orders`) | List with status, totals and line counts from `sales_order_items` |
| Finance (`/finance`) | Invoices with status, payments received per invoice, invoiced / received / outstanding totals |

**Out of scope by design:** HR, payroll, manufacturing / MRP, CRM, GST
filing, double-entry ledger, multi-warehouse transfers, barcode scanning.
Those are Premium-scope additions, quoted separately — do not promise them
as included.

## Database

Tables in `supabase/schema.sql`: `tenants`, `profiles`, `products`,
`suppliers`, `stock_movements`, `purchase_orders`,
`purchase_order_items`, `sales_orders`, `sales_order_items`, `invoices`,
`payments`. RLS is enabled on every table with a `tenant isolation`
policy (`tenant_id = public.current_tenant_id()`). A database trigger
`stock_no_negative` blocks any stock movement that would take a product
below zero — the guardrail lives in the database, not just in the UI.
Stock math is centralised in `src/lib/stock.ts` (`stockStatus`,
`orderTotal`).

## Demo / seed data

`supabase/seed.sql` inserts one fictional tenant, **Acme Demo Traders**,
with 4 demo products, 2 suppliers, opening stock (one product
deliberately at/below reorder level, one low), 3 purchase orders, 3 sales
orders with lines, 3 invoices and 1 payment. All names, emails and phone
numbers are invented. No real customers, suppliers or transactions.

## Setup / run

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
# In the Supabase SQL editor, run supabase/schema.sql, then supabase/seed.sql
# Create an auth user, then insert a profiles row for tenant
#   '22222222-2222-2222-2222-222222222222' (see CRM README for the SQL shape)
npm run dev                  # http://localhost:3000
npm run build
```

## Not yet implemented

- Creating a sales order / purchase-order lines from the UI (schema ready; the PO form creates the header only, lines are seeded)
- Posting stock movements automatically when a PO is marked received or a sales order is shipped (currently a manual adjustment on /inventory; the negative-stock trigger is already in place for when this is built)
- Invoice generation from a sales order, and recording a payment from the UI (payments are seeded; finance page is read-only for now)
- Roles inside a tenant, audit log, search/pagination, automated tests
- GST rates/tax calculation, ledger, HR/payroll, manufacturing — all out of scope for this slice

## Tech

TypeScript, React, Next.js 14 (App Router), Tailwind CSS, Supabase
(PostgreSQL, Auth, RLS, triggers), `@supabase/ssr` /
`@supabase/supabase-js`. Built by Bhavya Patel — B.Tech Computer Science
and Design, GCET Anand; Master of Business Analytics, Deakin University,
GIFT City.

## What I would do differently

- This SQL has never been run against a live Supabase project. I would run `schema.sql` and `seed.sql` in a free project and verify tenant isolation with two real auth users, as was done for the CRM and Marketplace samples on 13 Nov 2026.
- Stock is not posted automatically when a PO is marked received or a sales order is shipped; it is a manual adjustment on /inventory. I would wire that posting up next, since the negative-stock trigger is already in place.
- Purchase-order lines can only be seeded, not created from the UI, and invoice generation and payment recording from the UI are missing. I would build those flows before showing this to a paying client.
