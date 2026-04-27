"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Activity, MapPin } from "lucide-react";

interface Log {
  id: number;
  log_name: string;
  description: string;
  subject_type?: string;
  causer?: { id: number; name: string };
  properties?: { latitude?: number; longitude?: number; ip?: string; [key: string]: unknown };
  created_at: string;
}

const logColors: Record<string, string> = {
  order:     "bg-[#C9A880]/15 text-[#C9A880] border border-[#C9A880]/30",
  pos:       "bg-[#C9A880]/10 text-[#C9A880]/70 border border-[#C9A880]/20",
  promotion: "bg-white/5 text-white/60 border border-white/10",
};

export default function ActivityLogsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const { data } = useQuery<{ data: Log[] }>({
    queryKey: ["admin", "activity-logs", { dateFrom, dateTo }],
    queryFn:  () => adminApi.activityLogs({ date_from: dateFrom || undefined, date_to: dateTo || undefined }).then((r) => r.data),
  });

  const logs: Log[] = Array.isArray(data)
    ? (data as unknown as Log[])
    : (data as { data: Log[] })?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2.5">
        <Activity className="w-5 h-5 text-[#C9A880]" /> Activity Logs
      </h1>

      <div className="flex gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5">From</p>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#111111] border-[#2A2520] text-white rounded-none h-9 w-40 focus-visible:ring-[#C9A880]/30" />
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] mb-1.5">To</p>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#111111] border-[#2A2520] text-white rounded-none h-9 w-40 focus-visible:ring-[#C9A880]/30" />
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2A2520] rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2520]">
              <tr>
                {["Log", "Action", "By", "Location", "IP", "Module", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-black tracking-[0.25em] uppercase text-[#7A6050]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1A17]">
              {logs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#3A3530] text-xs">No activity logs found.</td></tr>
              )}
              {logs.map((log) => {
                const lat = log.properties?.latitude;
                const lng = log.properties?.longitude;
                const ip  = log.properties?.ip;
                return (
                  <tr key={log.id} className="hover:bg-[#1E1A17]/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        logColors[log.log_name] ?? "bg-[#1E1A17] text-[#7A6050] border border-[#2A2520]"
                      }`}>
                        {log.log_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">{log.description}</td>
                    <td className="px-4 py-3 text-xs text-[#7A6050]">{log.causer?.name ?? "System"}</td>
                    <td className="px-4 py-3">
                      {lat && lng ? (
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-[#C9A880] hover:text-white transition-colors whitespace-nowrap">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#3A3530]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[#3A3530] font-mono">{ip ?? "—"}</td>
                    <td className="px-4 py-3 text-[10px] text-[#3A3530]">{log.subject_type?.split("\\").pop()}</td>
                    <td className="px-4 py-3 text-[10px] text-[#7A6050] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
