import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/Badge"; import { inr, fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function SalesOrdersPage() {
  const supabase = createClient();
  const { data } = await supabase.from("sales_orders").select("id,so_number,customer_name,status,total_inr,ordered_at").order("ordered_at", { ascending: false });
  const { data: items } = await supabase.from("sales_order_items").select("sales_order_id,product_id,qty,unit_price_inr");
  const lines = new Map<string, number>(); (items ?? []).forEach((i) => lines.set(i.sales_order_id, (lines.get(i.sales_order_id) ?? 0) + 1));
  return (<div><h1 className="text-2xl font-bold">Sales orders</h1>
    <p className="mt-1 text-sm text-slate-500">Draft → confirmed → shipped → delivered. Each order's lines are stored in sales_order_items; invoicing is on /finance.</p>
    <div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-slate-500"><th className="px-4 py-2">SO</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Lines</th><th className="px-4 py-2">Total</th><th className="px-4 py-2">Ordered</th><th className="px-4 py-2">Status</th></tr></thead>
      <tbody>{(data ?? []).map((o) => (<tr key={o.id} className="border-b"><td className="px-4 py-2 font-mono text-xs">{o.so_number}</td><td className="px-4 py-2 font-medium">{o.customer_name}</td><td className="px-4 py-2">{lines.get(o.id) ?? 0}</td><td className="px-4 py-2">{inr(o.total_inr)}</td><td className="px-4 py-2">{fmtDate(o.ordered_at)}</td><td className="px-4 py-2"><Badge value={o.status} /></td></tr>))}
      {(data ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No sales orders yet — run supabase/seed.sql.</td></tr>}</tbody></table></div>
    <p className="mt-3 text-xs text-slate-500">Creating a sales order from the UI and deducting stock on shipment are not yet built — see README. The schema (sales_orders + sales_order_items + the negative-stock trigger) is ready for that flow.</p></div>);
}
