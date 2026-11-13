"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function AdjustStockForm({ products }: { products: { id: string; name: string }[] }) {
  const supabase = createClient();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState(""); const [reason, setReason] = useState("manual adjustment"); const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) { e.preventDefault(); setMsg("");
    const change = Number(qty); if (!change) { setMsg("Enter a non-zero quantity (positive = receipt, negative = issue)."); return; }
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { setMsg("Sign in first."); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    const tenant_id = (profile as { tenant_id: string } | null)?.tenant_id; if (!tenant_id) { setMsg("No tenant on your profile yet."); return; }
    const { error } = await supabase.from("stock_movements").insert({ tenant_id, product_id: productId, location: "Main Store", change_qty: change, reason });
    if (error) setMsg(error.message); else { setMsg("Movement recorded. Refresh to see the new on-hand figure."); setQty(""); } }
  if (products.length === 0) return null;
  return (<form onSubmit={submit} className="mt-4 flex flex-wrap gap-2 rounded-xl border bg-white p-4">
    <select value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded border px-3 py-2 text-sm">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="+10 receipt / -2 issue" inputMode="numeric" className="w-48 rounded border px-3 py-2 text-sm" />
    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="flex-1 rounded border px-3 py-2 text-sm" />
    <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Record movement</button>
    {msg && <p className="w-full text-sm text-slate-600">{msg}</p>}</form>);
}
