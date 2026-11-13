const tones: Record<string, string> = {
  new: "bg-blue-100 text-blue-800", contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-emerald-100 text-emerald-800", lost: "bg-rose-100 text-rose-800",
  won: "bg-emerald-100 text-emerald-800", open: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800", pending: "bg-amber-100 text-amber-800",
  shipped: "bg-violet-100 text-violet-800", cancelled: "bg-rose-100 text-rose-800",
  draft: "bg-slate-100 text-slate-700", active: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-rose-100 text-rose-800", out_of_stock: "bg-rose-100 text-rose-800",
  in_stock: "bg-emerald-100 text-emerald-800", overdue: "bg-rose-100 text-rose-800",
  completed: "bg-emerald-100 text-emerald-800", scheduled: "bg-blue-100 text-blue-800",
};
export default function Badge({ value }: { value: string }) {
  const key = value.toLowerCase().replace(/\s+/g, "_");
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[key] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
}
