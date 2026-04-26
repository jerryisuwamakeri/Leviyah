"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  TrendingUp, ShoppingCart, Users, Package,
  MessageSquare, DollarSign, ArrowUp, ArrowDown, ChevronRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import Link from "next/link";
import type { Order } from "@/types";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}
function pct(a: number, b: number) {
  if (!b) return null;
  const p = ((a - b) / b) * 100;
  return { val: Math.abs(p).toFixed(1), up: p >= 0 };
}

function StatCard({ title, value, sub, icon: Icon, highlight = false, trend }: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; highlight?: boolean;
  trend?: { val: string; up: boolean } | null;
}) {
  return (
    <div className={`border p-5 flex flex-col gap-3 ${
      highlight ? "bg-[#C9A880] border-[#B8905C]" : "bg-[#111111] border-[#2A2520] hover:border-[#C9A880]/40 transition-colors"
    }`}>
      <div className="flex items-start justify-between">
        <p className={`text-[9px] font-bold tracking-[0.25em] uppercase ${highlight ? "text-[#111111]/60" : "text-[#7A6050]"}`}>{title}</p>
        <Icon className={`w-4 h-4 ${highlight ? "text-[#111111]/40" : "text-[#C9A880]/60"}`} />
      </div>
      <p className={`text-2xl font-black leading-none ${highlight ? "text-[#111111]" : "text-white"}`}>{value}</p>
      <div className="flex items-center justify-between">
        {sub && <p className={`text-[10px] ${highlight ? "text-[#111111]/50" : "text-[#7A6050]"}`}>{sub}</p>}
        {trend && (
          <span className={`flex items-center gap-0.5 text-[9px] font-bold ${
            trend.up ? (highlight ? "text-[#111111]/70" : "text-[#C9A880]") : (highlight ? "text-[#111111]/50" : "text-[#7A6050]")
          }`}>
            {trend.up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
            {trend.val}%
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30",
    confirmed:  "bg-white/10 text-white border border-white/20",
    processing: "bg-[#C9A880]/10 text-[#C9A880]/80 border border-[#C9A880]/20",
    shipped:    "bg-white/5 text-white/60 border border-white/10",
    delivered:  "bg-[#C9A880]/20 text-[#C9A880] border border-[#C9A880]/40",
    cancelled:  "bg-[#2A2520] text-[#7A6050] border border-[#2A2520]",
    refunded:   "bg-[#1E1A17] text-[#7A6050] border border-[#2A2520]",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${map[status] ?? map.confirmed}`}>
      {status}
    </span>
  );
}

const SHADES = ["#C9A880","#B8905C","#9A7548","#7A5C38","#5C4530","#3E2E20"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery<{
    stats: Record<string, number>;
    revenue_chart: { date: string; total: number; count: number }[];
    orders_chart:  { date: string; count: number }[];
    orders_by_status: Record<string, number>;
    top_products: { product_name: string; total_sold: number; total_revenue: number }[];
    revenue_by_gateway: { gateway: string; total: number; count: number }[];
    recent_orders: Order[];
  }>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminApi.dashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const s         = data?.stats ?? {};
  const orders    = data?.recent_orders ?? [];
  const revChart  = data?.revenue_chart ?? [];
  const ordChart  = data?.orders_chart  ?? [];
  const topProd   = data?.top_products  ?? [];
  const byStatus  = Object.entries(data?.orders_by_status ?? {}).map(([name, value]) => ({ name, value }));
  const byGateway = data?.revenue_by_gateway ?? [];
  const revTrend  = pct(Number(s.monthly_revenue), Number(s.last_month_revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A880]">Overview</p>
          <h1 className="text-2xl font-black text-white mt-1">Dashboard</h1>
        </div>
        <p className="text-[10px] text-[#7A6050]">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-[#111111] border border-[#2A2520] animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard highlight title="Total Revenue"  value={formatNGN(s.total_revenue ?? 0)}   sub="All time"                          icon={DollarSign} />
            <StatCard         title="Monthly Revenue" value={formatNGN(s.monthly_revenue ?? 0)} sub="This month"  trend={revTrend}      icon={TrendingUp} />
            <StatCard         title="Today's Revenue" value={formatNGN(s.today_revenue ?? 0)}   sub="Today"                             icon={DollarSign} />
            <StatCard         title="Pending Orders"  value={String(s.pending_orders ?? 0)}      sub="Need action"                      icon={ShoppingCart} />
            <StatCard         title="Total Orders"    value={String(s.total_orders ?? 0)}        sub={`${s.delivered_orders ?? 0} delivered`} icon={ShoppingCart} />
            <StatCard         title="Customers"       value={String(s.total_customers ?? 0)}     sub={`+${s.new_customers ?? 0} this month`}  icon={Users} />
            <StatCard         title="Products"        value={String(s.total_products ?? 0)}      sub={`${s.low_stock ?? 0} low · ${s.out_of_stock ?? 0} OOS`} icon={Package} />
            <StatCard         title="Open Chats"      value={String(s.open_chats ?? 0)}          sub="Awaiting response"                icon={MessageSquare} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-[#111111] border border-[#2A2520] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">Revenue — Last 30 Days</p>
                <p className="text-[#C9A880] text-xs font-bold">{formatNGN(revChart.reduce((a, c) => a + Number(c.total), 0))}</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revChart}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1E1A17" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#7A6050" }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#7A6050" }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: unknown) => [typeof v === "number" ? formatNGN(v) : String(v), "Revenue"]}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ background: "#0E0C0A", border: "1px solid #2A2520", borderRadius: 0, fontSize: 11 }}
                    labelStyle={{ color: "#C9A880" }} itemStyle={{ color: "#FAFAFA" }}
                    cursor={{ stroke: "#C9A880", strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#C9A880" strokeWidth={2} dot={false} activeDot={{ fill: "#C9A880", stroke: "#0E0C0A", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#111111] border border-[#2A2520] p-5">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050] mb-1">Orders by Status</p>
              {byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={72} innerRadius={38}>
                      {byStatus.map((_, i) => <Cell key={i} fill={SHADES[i % SHADES.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0E0C0A", border: "1px solid #2A2520", borderRadius: 0, fontSize: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-[#3A3530] text-xs">No orders yet</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#111111] border border-[#2A2520] p-5">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050] mb-4">Orders — Last 30 Days</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={ordChart} barSize={6}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1E1A17" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#7A6050" }} tickFormatter={(d) => d.slice(8)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: "#7A6050" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0E0C0A", border: "1px solid #2A2520", borderRadius: 0, fontSize: 10 }} cursor={{ fill: "#1E1A17" }} />
                  <Bar dataKey="count" fill="#C9A880" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#111111] border border-[#2A2520] p-5">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050] mb-4">Revenue by Channel</p>
              {byGateway.length > 0 ? (
                <div className="space-y-3.5 mt-1">
                  {byGateway.map((g, i) => {
                    const max = Math.max(...byGateway.map(x => Number(x.total)));
                    const w   = max > 0 ? (Number(g.total) / max) * 100 : 0;
                    return (
                      <div key={g.gateway}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#7A6050] capitalize">{g.gateway.replace("_", " ")}</span>
                          <span className="text-[10px] font-bold text-white">{formatNGN(Number(g.total))}</span>
                        </div>
                        <div className="h-1 bg-[#1E1A17]">
                          <div className="h-full bg-[#C9A880] transition-all" style={{ width: `${w}%`, opacity: 0.5 + 0.5 * (1 - i * 0.15) }} />
                        </div>
                        <p className="text-[9px] text-[#3A3530] mt-0.5">{g.count} txns</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-[#3A3530] text-xs">No transactions yet</div>
              )}
            </div>

            <div className="bg-[#111111] border border-[#2A2520] p-5">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050] mb-4">Top Products</p>
              {topProd.length > 0 ? (
                <div className="space-y-3">
                  {topProd.map((p, i) => (
                    <div key={p.product_name} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#C9A880] w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-white truncate">{p.product_name}</p>
                        <p className="text-[9px] text-[#7A6050]">{p.total_sold} sold</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#C9A880] shrink-0">{formatNGN(Number(p.total_revenue))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-[#3A3530] text-xs">No sales yet</div>
              )}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#2A2520]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2520]">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7A6050]">Recent Orders</p>
              <Link href="/admin/orders" className="text-[9px] font-bold tracking-widest uppercase text-[#C9A880] hover:text-white transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E1A17]">
                    {["Order No.", "Customer", "Total", "Payment", "Status", "Date"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1714]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#0E0C0A] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#C9A880]">{o.order_number}</td>
                      <td className="px-5 py-3.5 text-xs text-white">{o.user?.name ?? "Guest"}</td>
                      <td className="px-5 py-3.5 text-xs font-black text-white">{formatNGN(o.total)}</td>
                      <td className="px-5 py-3.5 text-xs text-[#7A6050] capitalize">{o.payment_method?.replace("_"," ")}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-[#7A6050]">{new Date(o.created_at).toLocaleDateString("en-NG")}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-[#3A3530] text-xs">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
