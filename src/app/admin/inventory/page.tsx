"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { TrendingUp, TrendingDown, Package, AlertTriangle, Star } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

export default function InventoryPage() {
  const [period, setPeriod] = useState("month");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-report", period],
    queryFn: () => adminApi.inventoryReport({ period }).then(r => r.data),
  });

  const summary    = data?.summary ?? {};
  const lowStock   = data?.low_stock ?? [];
  const outOfStock = data?.out_of_stock ?? [];
  const bestSellers = data?.best_sellers_by_category ?? [];

  const chartData = useMemo(() => {
    const revMap: Record<string, number> = {};
    const expMap: Record<string, number> = {};
    (data?.revenue_chart ?? []).forEach((d: any) => { revMap[d.period] = Number(d.total); });
    (data?.expenses_chart ?? []).forEach((d: any) => { expMap[d.period] = Number(d.total); });
    const periods = Array.from(new Set([...Object.keys(revMap), ...Object.keys(expMap)])).sort();
    return periods.map(p => ({
      period: p,
      revenue:  revMap[p] ?? 0,
      expenses: expMap[p] ?? 0,
      profit:   (revMap[p] ?? 0) - (expMap[p] ?? 0),
    }));
  }, [data]);

  const tickFmt = (d: string) => period === "year" ? d.slice(5) : d.slice(5);

  const statCards = [
    { label: "Revenue",         value: formatNGN(summary.total_revenue   ?? 0), icon: TrendingUp,   color: "text-green-500" },
    { label: "Expenses",        value: formatNGN(summary.total_expenses  ?? 0), icon: TrendingDown,  color: "text-red-500"   },
    { label: "Gross Profit",    value: formatNGN(summary.gross_profit    ?? 0), icon: TrendingUp,   color: (summary.gross_profit ?? 0) >= 0 ? "text-green-500" : "text-red-500" },
    { label: "Inventory Value", value: formatNGN(summary.inventory_value ?? 0), icon: Package,      color: "text-[#C9A880]"  },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header + period filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-[#111111]">Inventory & Reports</h1>
          <p className="text-xs text-[#B8A090] mt-0.5">Sales, profit, stock levels and best sellers</p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-colors ${period === p ? "bg-[#111111] text-white border-[#111111]" : "border-[#E8D8C4] text-[#7A6050] hover:border-[#C9A880]"}`}>
              {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-[#B8A090]">Loading report…</div>}

      {!isLoading && <>
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(c => (
            <div key={c.label} className="bg-white border border-[#E8D8C4] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#C9A880]">{c.label}</p>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-lg font-black text-[#111111]">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue vs Expenses vs Profit chart */}
        {chartData.length > 0 && (
          <div className="bg-white border border-[#E8D8C4] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Revenue · Expenses · Profit</p>
              <span className={`text-xs font-black ${(summary.gross_profit ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                {formatNGN(summary.gross_profit ?? 0)} net
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F5EAD8" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 9, fill: "#B8A090" }}
                  tickFormatter={tickFmt}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#B8A090" }}
                  tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [typeof v === "number" ? formatNGN(v) : String(v), String(name)]}
                  labelFormatter={l => `Period: ${l}`}
                  contentStyle={{ background: "#fff", border: "1px solid #E8D8C4", borderRadius: 0, fontSize: 11 }}
                  labelStyle={{ color: "#C9A880" }}
                  cursor={{ stroke: "#E8D8C4", strokeWidth: 1 }}
                />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 8 }} />
                <Line type="monotone" dataKey="revenue"  name="Revenue"  stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="profit"   name="Profit"   stroke="#C9A880" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low stock */}
          <div className="bg-white border border-[#E8D8C4]">
            <div className="px-5 py-3.5 border-b border-[#E8D8C4] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">
                Low Stock ({lowStock.length})
              </p>
            </div>
            {lowStock.length === 0
              ? <p className="p-5 text-sm text-[#B8A090]">All products are well stocked.</p>
              : <div className="divide-y divide-[#F5EAD8]">
                  {lowStock.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">{p.name}</p>
                        <p className="text-[10px] text-[#B8A090]">{p.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">
                          {p.stock_quantity} left
                        </span>
                        <p className="text-[9px] text-[#B8A090] mt-0.5">threshold: {p.low_stock_threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Out of stock */}
          <div className="bg-white border border-[#E8D8C4]">
            <div className="px-5 py-3.5 border-b border-[#E8D8C4] flex items-center gap-2">
              <Package className="w-4 h-4 text-red-500" />
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">
                Out of Stock ({outOfStock.length})
              </p>
            </div>
            {outOfStock.length === 0
              ? <p className="p-5 text-sm text-[#B8A090]">No products are out of stock.</p>
              : <div className="divide-y divide-[#F5EAD8]">
                  {outOfStock.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">{p.name}</p>
                        <p className="text-[10px] text-[#B8A090]">{p.category?.name}</p>
                      </div>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">
                        Out of Stock
                      </span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Best sellers by category */}
        <div className="bg-white border border-[#E8D8C4]">
          <div className="px-5 py-3.5 border-b border-[#E8D8C4] flex items-center gap-2">
            <Star className="w-4 h-4 text-[#C9A880]" />
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Best Sellers by Category</p>
          </div>
          {bestSellers.length === 0
            ? <p className="p-5 text-sm text-[#B8A090]">No sales data for this period.</p>
            : <div className="divide-y divide-[#F5EAD8]">
                {bestSellers.map((cat: any) => (
                  <div key={cat.id} className="px-5 py-4">
                    <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#C9A880] mb-3">{cat.name}</p>
                    {cat.products?.length === 0
                      ? <p className="text-xs text-[#B8A090]">No sales yet.</p>
                      : <div className="space-y-2.5">
                          {cat.products?.map((p: any, i: number) => {
                            const maxRev = Math.max(...(cat.products ?? []).map((x: any) => x.revenue ?? 0));
                            const barW   = maxRev > 0 ? ((p.revenue ?? 0) / maxRev) * 100 : 0;
                            return (
                              <div key={p.id}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-[#C9A880] w-4">{i + 1}</span>
                                    <p className="text-sm text-[#111111]">{p.name}</p>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-[#7A6050]">
                                    <span>{p.units_sold ?? 0} sold</span>
                                    <span className="font-black text-[#111111]">{formatNGN(p.revenue ?? 0)}</span>
                                  </div>
                                </div>
                                <div className="h-1 bg-[#F5EAD8] ml-7">
                                  <div className="h-full bg-[#C9A880] transition-all" style={{ width: `${barW}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                    }
                  </div>
                ))}
              </div>
          }
        </div>
      </>}
    </div>
  );
}
