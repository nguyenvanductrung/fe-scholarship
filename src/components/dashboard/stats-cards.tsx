"use client";

import { Banknote, CheckCircle2, Clock, Wallet } from "lucide-react";

import { useStatsQuery } from "@/hooks/use-dashboard-queries";
import { lovelaceToAda } from "@/lib/utils";

import { StatsCardsSkeleton } from "./skeletons";

const cards = [
  {
    key: "fund",
    label: "Tổng quỹ",
    icon: Wallet,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "approved",
    label: "Đã duyệt",
    icon: CheckCircle2,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    key: "disbursed",
    label: "Đã giải ngân",
    icon: Banknote,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "pending",
    label: "Đang chờ",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
] as const;

export function StatsCards() {
  const { data, isLoading, isError, error } = useStatsQuery();

  if (isLoading) return <StatsCardsSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Không tải được thống kê:{" "}
        {error instanceof Error ? error.message : "Lỗi không xác định"}
      </div>
    );
  }

  const values: Record<(typeof cards)[number]["key"], string> = {
    fund: lovelaceToAda(data.total_funded_lovelace, { prefix: true }),
    approved: data.total_approved.toLocaleString("vi-VN"),
    disbursed: lovelaceToAda(data.total_disbursed_lovelace, { prefix: true }),
    pending: data.total_pending.toLocaleString("vi-VN"),
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-zinc-400">{label}</p>
            <span className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`size-4 ${color}`} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
