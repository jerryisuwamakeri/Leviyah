"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Tag } from "lucide-react";

interface Promo { id: number; name: string; percentage: number; ends_at?: string; }

export default function PromoBanner() {
  const { data } = useQuery<{ promotions: Promo[]; active_percentage: number }>({
    queryKey: ["promos-active"],
    queryFn: () => api.get("/promotions/active").then((r) => r.data),
    staleTime: 60_000,
  });

  const promos = data?.promotions ?? [];
  if (promos.length === 0) return null;
  const top = promos[0];

  return (
    <div className="bg-[#C9A880] text-[#111111] py-2.5 px-4 text-center">
      <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase">
        <Tag className="w-3 h-3" />
        {top.name} — {top.percentage}% off everything
        {top.ends_at && (
          <span className="opacity-60">· Ends {new Date(top.ends_at).toLocaleDateString()}</span>
        )}
      </span>
    </div>
  );
}
