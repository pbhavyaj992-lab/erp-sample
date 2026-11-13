import "./globals.css";
import type { ReactNode } from "react";
const nav = [["Dashboard", "/"], ["Inventory", "/inventory"], ["Purchase orders", "/purchase-orders"], ["Sales orders", "/sales-orders"], ["Finance", "/finance"]];
export const metadata = { title: "ERP Sample — Demo", description: "Narrow ERP slice (inventory, purchasing, sales, basic finance) built with Next.js and Supabase. Demo data only." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body>
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-slate-900 p-4 text-white">
        <p className="text-lg font-bold">ERP Sample</p>
        <p className="mt-0.5 text-xs text-slate-400">Inventory · Purchasing · Sales · Finance</p>
        <nav className="mt-6 space-y-1">{nav.map(([label, href]) => (
          <a key={href} href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-800">{label}</a>))}</nav>
        <p className="mt-8 text-xs leading-relaxed text-slate-400">Narrow slice on purpose: 4 modules only. Multi-tenant via Supabase RLS — every row carries tenant_id.</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div></body></html>);
}
