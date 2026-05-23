"use client";

import {
  Ban,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";

import { useTransactionsQuery } from "@/hooks/use-dashboard-queries";
import { cn, formatRelativeTime, getCardanoScanTxUrl } from "@/lib/utils";
import type { TxDetail, TxType } from "@/types/api";

import { TimelineSkeleton } from "./skeletons";

const TX_META: Record<
  TxType,
  { label: string; icon: typeof Banknote; className: string }
> = {
  fund: {
    label: "Nạp quỹ",
    icon: CircleDollarSign,
    className: "bg-emerald-500/15 text-emerald-400",
  },
  approve: {
    label: "Duyệt học bổng",
    icon: CheckCircle2,
    className: "bg-sky-500/15 text-sky-400",
  },
  claim: {
    label: "Giải ngân",
    icon: Banknote,
    className: "bg-violet-500/15 text-violet-400",
  },
  revoke: {
    label: "Thu hồi",
    icon: Ban,
    className: "bg-red-500/15 text-red-400",
  },
};

function normalizeTxType(raw?: string): TxType {
  if (raw === "approve" || raw === "claim" || raw === "revoke" || raw === "fund") {
    return raw;
  }
  return "fund";
}

export function TimelineFeed() {
  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } =
    useTransactionsQuery();

  if (isLoading) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">
          Hoạt động gần đây
        </h2>
        <TimelineSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
        Không tải được timeline:{" "}
        {error instanceof Error ? error.message : "Lỗi không xác định"}
      </section>
    );
  }

  const txs: TxDetail[] = (data ?? []).slice(0, 10);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Hoạt động gần đây
          </h2>
          <p className="text-xs text-zinc-500">
            10 giao dịch mới nhất · tự làm mới 30s
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-xs text-zinc-500",
            isFetching && "text-emerald-500",
          )}
        >
          <RefreshCw
            className={cn("size-3.5", isFetching && "animate-spin")}
          />
          {dataUpdatedAt
            ? formatRelativeTime(Math.floor(dataUpdatedAt / 1000))
            : "—"}
        </span>
      </div>

      {txs.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Chưa có giao dịch nào.
        </p>
      ) : (
        <ul className="space-y-4">
          {txs.map((tx) => (
            <TimelineItem key={tx.tx_hash} tx={tx} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TimelineItem({ tx }: { tx: TxDetail }) {
  const type = normalizeTxType(tx.tx_type);
  const meta = TX_META[type];
  const Icon = meta.icon;
  const blockTime = tx.block_time
    ? formatRelativeTime(tx.block_time)
    : "Chua ro thoi gian";

  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          meta.className,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-zinc-100">{meta.label}</span>
          <span className="text-xs text-zinc-500">
            {blockTime}
          </span>
        </div>
        <a
          href={getCardanoScanTxUrl(tx.tx_hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block truncate font-mono text-xs text-sky-400 hover:text-sky-300 hover:underline"
        >
          {tx.tx_hash}
        </a>
        <p className="mt-1 text-xs text-zinc-500">
          Block #{tx.block_height.toLocaleString("vi-VN")} · phí{" "}
          {(Number(tx.fees) / 1_000_000).toFixed(4)} ADA
        </p>
      </div>
    </li>
  );
}
