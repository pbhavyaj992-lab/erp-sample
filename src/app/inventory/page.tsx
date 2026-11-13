import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/Badge"; import { inr } from "@/lib/format"; import { stockStatus } from "@/lib/stock";
import AdjustStockForm from "./AdjustStockForm";
export const dynamic = "force-dynamic";
export default async function InventoryPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("id,sku,name,unit,cost_inr,price_inr,reorder_level").order("name");
  const { data: moves } = await supabase.from("stock_movements").select("product_id,location,change_qty");
  const stock = new Map<string, { qty: number; location: string }>();
  (moves ?? []).forEach((m) => { const cur = stock.get(m.product_id) ?? { qty: 0, location: m.location }; stock.set(m.product_id, { qty: cur.qty + m.change_qty, location: m.location }); });
  return (<div><h1 className="text-2xl font-bold">Inventory</h1>
    <p className="mt-1 text-sm text-slate-500">Stock on hand is derived from stock movements (receipts add, sales/issues subtract). Adjustments below write a movement row — stock is never edited directly.</p>
    <AdjustStockForm products={(products ?? []).map((p) => ({ id: p.id, name: p.name }))} />
    <div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-slate-500"><th className="px-4 py-2">SKU</th><th className="px-4 py-2">Product</th><th className="px-4 py-2">On hand</th><th className="px-4 py-2">Reorder at</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Cost / Price</th></tr></thead>
      <tbody>{(products ?? []).map((p) => { const s = stock.get(p.id) ?? { qty: 0, location: "Main Store" }; const status = stockStatus(s.qty, p.reorder_level);
        return (<tr key={p.id} className="border-b"><td className="px-4 py-2 font-mono text-xs">{p.sku}</td><td className="px-4 py-2 font-medium">{p.name}<span className="block text-xs text-slate-500">{s.location} · per {p.unit}</span></td>
        <td className="px-4 py-2 font-bold">{s.qty}</td><td className="px-4 py-2">{p.reorder_level}</td><td className="px-4 py-2"><Badge value={status} /></td><td className="px-4 py-2">{inr(p.cost_inr)} / {inr(p.price_inr)}</td></tr>); })}
      {(products ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No products yet — run supabase/seed.sql.</td></tr>}</tbody></table></div></div>);
}
