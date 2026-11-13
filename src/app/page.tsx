import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard"; import Badge from "@/components/Badge"; import { inr, fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const supabase = createClient();
  const [products, pos, sos, invoices] = await Promise.all([
    supabase.from("products").select("id,name,sku,reorder_level"),
    supabase.from("purchase_orders").select("id,po_number,status,total_inr,ordered_at").order("ordered_at", { ascending: false }).limit(5),
    supabase.from("sales_orders").select("id,so_number,customer_name,status,total_inr,ordered_at").order("ordered_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("id,invoice_number,amount_inr,status,due_date").order("created_at", { ascending: false }).limit(5),
  ]);
  const { data: moves } = await supabase.from("stock_movements").select("product_id,change_qty");
  const stockByProduct = new Map<string, number>();
  (moves ?? []).forEach((m) => stockByProduct.set(m.product_id, (stockByProduct.get(m.product_id) ?? 0) + m.change_qty));
  const lowStock = (products.data ?? []).filter((p) => (stockByProduct.get(p.id) ?? 0) <= p.reorder_level).length;
  const unpaid = (invoices.data ?? []).filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount_inr, 0);
  const openPO = (pos.data ?? []).filter((p) => p.status === "ordered").reduce((s, p) => s + p.total_inr, 0);
  return (<div><h1 className="text-2xl font-bold">Operations dashboard</h1>
    <p className="mt-1 text-sm text-slate-500">Demo data for Acme Demo Traders (fictional). Stock is the sum of stock movements per product.</p>
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Products" value={String((products.data ?? []).length)} sub={`${lowStock} at or below reorder level`} />
      <StatCard label="Open purchase orders" value={inr(openPO)} sub="Status = ordered" />
      <StatCard label="Unpaid invoices (shown)" value={inr(unpaid)} sub="Latest 5 invoices queried" />
      <StatCard label="Sales orders" value={String((sos.data ?? []).length)} sub="Latest 5" />
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border bg-white p-4"><h2 className="font-semibold">Latest sales orders</h2>
        <ul className="mt-3 space-y-2">{(sos.data ?? []).map((o) => (
          <li key={o.id} className="flex items-center justify-between border-b pb-2 text-sm"><span>{o.so_number} · {o.customer_name}</span><span className="flex items-center gap-2"><Badge value={o.status} />{inr(o.total_inr)}</span></li>))}
          {(sos.data ?? []).length === 0 && <li className="text-sm text-slate-500">No sales orders yet — run supabase/seed.sql.</li>}</ul></section>
      <section className="rounded-xl border bg-white p-4"><h2 className="font-semibold">Latest invoices</h2>
        <ul className="mt-3 space-y-2">{(invoices.data ?? []).map((i) => (
          <li key={i.id} className="flex items-center justify-between border-b pb-2 text-sm"><span>{i.invoice_number} · due {fmtDate(i.due_date)}</span><span className="flex items-center gap-2"><Badge value={i.status} />{inr(i.amount_inr)}</span></li>))}
          {(invoices.data ?? []).length === 0 && <li className="text-sm text-slate-500">No invoices yet — run supabase/seed.sql.</li>}</ul></section>
    </div></div>);
}
