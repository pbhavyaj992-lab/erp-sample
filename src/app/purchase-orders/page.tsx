"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PurchaseOrder } from "@/lib/types"; import Badge from "@/components/Badge"; import { inr, fmtDate } from "@/lib/format";
export default function PurchaseOrdersPage() {
  const supabase = createClient(); const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [supplierId, setSupplierId] = useState(""); const [total, setTotal] = useState(""); const [msg, setMsg] = useState("");
  async function load() {
    const { data } = await supabase.from("purchase_orders").select("*").order("ordered_at", { ascending: false }); setOrders((data as PurchaseOrder[]) ?? []);
    const { data: sup } = await supabase.from("suppliers").select("id,name").order("name"); setSuppliers((sup as { id: string; name: string }[]) ?? []); }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) {
    // Receiving a PO should also post stock movements for its lines.
    // That posting is NOT implemented yet — see README. Status only for now.
    await supabase.from("purchase_orders").update({ status }).eq("id", id); load(); }
  async function add(e: React.FormEvent) { e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { setMsg("Sign in first."); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    const tenant_id = (profile as { tenant_id: string } | null)?.tenant_id; if (!tenant_id) { setMsg("No tenant on your profile yet."); return; }
    const po_number = "PO-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
    const { error } = await supabase.from("purchase_orders").insert({ tenant_id, po_number, supplier_id: supplierId || null, status: "draft", total_inr: Number(total) || 0 });
    if (error) setMsg(error.message); else { setTotal(""); load(); } }
  return (<div><h1 className="text-2xl font-bold">Purchase orders</h1>
    <p className="mt-1 text-sm text-slate-500">Draft → ordered → received. Note: marking a PO “received” does not yet post stock — that step is listed under “Not yet implemented” in the README.</p>
    <form onSubmit={add} className="mt-4 flex gap-2 rounded-xl border bg-white p-4">
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded border px-3 py-2 text-sm"><option value="">Select supplier</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <input value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Total (₹)" inputMode="numeric" className="w-36 rounded border px-3 py-2 text-sm" />
      <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Create PO (draft)</button></form>
    {msg && <p className="mt-2 text-sm text-rose-600">{msg}</p>}
    <div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-slate-500"><th className="px-4 py-2">PO</th><th className="px-4 py-2">Total</th><th className="px-4 py-2">Ordered</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Change status</th></tr></thead>
      <tbody>{orders.map((o) => (<tr key={o.id} className="border-b"><td className="px-4 py-2 font-mono text-xs">{o.po_number}</td><td className="px-4 py-2">{inr(o.total_inr)}</td><td className="px-4 py-2">{fmtDate(o.ordered_at)}</td>
        <td className="px-4 py-2"><Badge value={o.status} /></td>
        <td className="px-4 py-2"><select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded border px-2 py-1 text-xs">{["draft", "ordered", "received", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</select></td></tr>))}
        {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No purchase orders yet — run supabase/seed.sql.</td></tr>}</tbody></table></div></div>);
}
