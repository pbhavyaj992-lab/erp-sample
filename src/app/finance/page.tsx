import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/Badge"; import { inr, fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function FinancePage() {
  const supabase = createClient();
  const { data: invoices } = await supabase.from("invoices").select("id,invoice_number,amount_inr,status,due_date,created_at").order("created_at", { ascending: false });
  const { data: payments } = await supabase.from("payments").select("id,invoice_id,amount_inr,method,paid_at").order("paid_at", { ascending: false });
  const paidByInvoice = new Map<string, number>(); (payments ?? []).forEach((p) => paidByInvoice.set(p.invoice_id ?? "", (paidByInvoice.get(p.invoice_id ?? "") ?? 0) + p.amount_inr));
  const totalInvoiced = (invoices ?? []).reduce((s, i) => s + i.amount_inr, 0);
  const totalPaid = (payments ?? []).reduce((s, p) => s + p.amount_inr, 0);
  return (<div><h1 className="text-2xl font-bold">Finance — basic</h1>
    <p className="mt-1 text-sm text-slate-500">Invoices, payments received and outstanding balance. This is receivables only — no ledger, GST filing or payroll (see README).</p>
    <div className="mt-4 grid grid-cols-3 gap-4">
      <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">Invoiced</p><p className="mt-1 text-xl font-bold">{inr(totalInvoiced)}</p></div>
      <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">Received</p><p className="mt-1 text-xl font-bold">{inr(totalPaid)}</p></div>
      <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-slate-500">Outstanding</p><p className="mt-1 text-xl font-bold">{inr(totalInvoiced - totalPaid)}</p></div>
    </div>
    <h2 className="mt-6 font-semibold">Invoices</h2>
    <div className="mt-2 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-slate-500"><th className="px-4 py-2">Invoice</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Paid so far</th><th className="px-4 py-2">Due</th><th className="px-4 py-2">Status</th></tr></thead>
      <tbody>{(invoices ?? []).map((i) => (<tr key={i.id} className="border-b"><td className="px-4 py-2 font-mono text-xs">{i.invoice_number}</td><td className="px-4 py-2">{inr(i.amount_inr)}</td><td className="px-4 py-2">{inr(paidByInvoice.get(i.id) ?? 0)}</td><td className="px-4 py-2">{fmtDate(i.due_date)}</td><td className="px-4 py-2"><Badge value={i.status} /></td></tr>))}
      {(invoices ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No invoices yet — run supabase/seed.sql.</td></tr>}</tbody></table></div>
    <h2 className="mt-6 font-semibold">Payments received</h2>
    <ul className="mt-2 space-y-2">{(payments ?? []).map((p) => (
      <li key={p.id} className="flex justify-between rounded-xl border bg-white p-3 text-sm"><span>{inr(p.amount_inr)} · {p.method ?? "—"}</span><span className="text-slate-500">{fmtDate(p.paid_at)}</span></li>))}
      {(payments ?? []).length === 0 && <li className="rounded-xl border bg-white p-3 text-sm text-slate-500">No payments recorded yet.</li>}</ul></div>);
}
