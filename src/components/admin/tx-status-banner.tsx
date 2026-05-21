"use client";

import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import type { TxFlowStep } from "@/hooks/use-admin-tx-flow";
import { cn, getCardanoScanTxUrl } from "@/lib/utils";

export function TxStatusBanner({
  step,
  label,
  txHash,
}: {
  step: TxFlowStep;
  label: string;
  txHash: string | null;
}) {
  if (step === "idle") return null;

  const isLoading = ["building", "signing", "submitting"].includes(step);
  const isSuccess = step === "success";
  const isError = step === "error";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
        isLoading && "border-sky-500/30 bg-sky-500/10 text-sky-200",
        isSuccess && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        isError && "border-red-500/30 bg-red-500/10 text-red-200",
      )}
    >
      {isLoading && <Loader2 className="size-5 shrink-0 animate-spin" />}
      {isSuccess && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        {isSuccess && txHash && (
          <a
            href={getCardanoScanTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-emerald-300 hover:underline"
          >
            {txHash.slice(0, 16)}…
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  );
}
