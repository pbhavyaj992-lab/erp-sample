-- ERP Sample — Supabase schema + RLS (PostgreSQL). Narrow slice only:
-- inventory, purchasing, sales orders, basic finance (receivables).
-- Same tenancy model as the CRM sample: profiles.tenant_id, every
-- business row carries tenant_id, RLS enforces tenant isolation.
create extension if not exists "pgcrypto";
create table if not exists public.tenants (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, created_at timestamptz not null default now());
create table if not exists public.profiles (id uuid primary key references auth.users (id) on delete cascade, tenant_id uuid references public.tenants (id) on delete cascade, full_name text, created_at timestamptz not null default now());
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  sku text not null, name text not null, unit text not null default 'pcs',
  cost_inr numeric not null default 0, price_inr numeric not null default 0, reorder_level int not null default 0,
  created_at timestamptz not null default now(), unique (tenant_id, sku)
);
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null, email text, phone text, gstin text, created_at timestamptz not null default now()
);
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  location text not null default 'Main Store', change_qty int not null, reason text not null default 'manual adjustment',
  created_at timestamptz not null default now()
);
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  po_number text not null, supplier_id uuid references public.suppliers (id) on delete set null,
  status text not null default 'draft' check (status in ('draft','ordered','received','cancelled')),
  total_inr numeric not null default 0, ordered_at timestamptz not null default now(), unique (tenant_id, po_number)
);
create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  product_id uuid not null references public.products (id), qty int not null check (qty > 0), unit_cost_inr numeric not null default 0
);
create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  so_number text not null, customer_name text not null,
  status text not null default 'draft' check (status in ('draft','confirmed','shipped','delivered','cancelled')),
  total_inr numeric not null default 0, ordered_at timestamptz not null default now(), unique (tenant_id, so_number)
);
create table if not exists public.sales_order_items (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders (id) on delete cascade,
  product_id uuid not null references public.products (id), qty int not null check (qty > 0), unit_price_inr numeric not null default 0
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  invoice_number text not null, sales_order_id uuid references public.sales_orders (id) on delete set null,
  amount_inr numeric not null default 0, status text not null default 'unpaid' check (status in ('unpaid','partially_paid','paid','overdue')),
  due_date date, created_at timestamptz not null default now(), unique (tenant_id, invoice_number)
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants (id) on delete cascade,
  invoice_id uuid references public.invoices (id) on delete set null,
  amount_inr numeric not null check (amount_inr > 0), method text, paid_at timestamptz not null default now()
);
-- Guardrail: stock on hand (sum of movements) must not go below zero
-- for a product. This blocks a negative stock movement at the database
-- level even if a future UI/API bug tries to post one.
create or replace function public.prevent_negative_stock() returns trigger language plpgsql as $$
declare on_hand int;
begin
  select coalesce(sum(change_qty), 0) into on_hand from public.stock_movements where product_id = new.product_id;
  if on_hand + new.change_qty < 0 then raise exception 'Insufficient stock for product % (on hand %)', new.product_id, on_hand; end if;
  return new;
end $$;
drop trigger if exists stock_no_negative on public.stock_movements;
create trigger stock_no_negative before insert on public.stock_movements for each row execute function public.prevent_negative_stock();
create index if not exists stock_movements_product_idx on public.stock_movements (product_id, created_at desc);
create index if not exists po_tenant_idx on public.purchase_orders (tenant_id, ordered_at desc);
create index if not exists so_tenant_idx on public.sales_orders (tenant_id, ordered_at desc);
create index if not exists invoices_tenant_idx on public.invoices (tenant_id, status);
alter table public.tenants enable row level security; alter table public.profiles enable row level security;
alter table public.products enable row level security; alter table public.suppliers enable row level security;
alter table public.stock_movements enable row level security; alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security; alter table public.sales_orders enable row level security;
alter table public.sales_order_items enable row level security; alter table public.invoices enable row level security;
alter table public.payments enable row level security;
create or replace function public.current_tenant_id() returns uuid language sql security definer stable as
  $$ select tenant_id from public.profiles where id = auth.uid() $$;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own tenant" on public.tenants;
create policy "own tenant" on public.tenants for select using (id = public.current_tenant_id());
-- Tenant-isolation policy, same shape, on every business table:
do $$ declare t text; begin
  foreach t in array array['products','suppliers','stock_movements','purchase_orders','purchase_order_items','sales_orders','sales_order_items','invoices','payments'] loop
    execute format('drop policy if exists "tenant isolation" on public.%I', t);
    execute format('create policy "tenant isolation" on public.%I for all using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id())', t);
  end loop;
end $$;
