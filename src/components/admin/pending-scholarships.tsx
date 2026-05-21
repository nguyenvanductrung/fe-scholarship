"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { ScholarshipStatusBadge } from "@/components/dashboard/scholarship-status-badge";
import { dashboardKeys } from "@/hooks/use-dashboard-queries";
import { useAdminTxFlow } from "@/hooks/use-admin-tx-flow";
import { fetchScholarships } from "@/lib/api";
import { lovelaceToAda } from "@/lib/utils";
import type { ScholarshipInfo } from "@/types/api";

import { RevokeModal } from "./revoke-modal";
import { TxStatusBanner } from "./tx-status-banner";

export function PendingScholarships() {
  const queryClient = useQueryClient();
  const {
    step,
    stepLabel,
    lastTxHash,
    isBusy,
    approveScholarship,
    revokeScholarship,
    reset,
  } = useAdminTxFlow();

  const [revokeTarget, setRevokeTarget] = useState<ScholarshipInfo | null>(null);
  const [actionUtxo, setActionUtxo] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "pending-scholarships"],
    queryFn: () => fetchScholarships({ page: 1, size: 100 }),
    select: (res) => res.data.filter((s) => s.status === 0),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "scholarships"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "pending-scholarships"] });
    refetch();
  };

  const handleApprove = async (row: ScholarshipInfo) => {
    const utxoRef = `${row.utxo_hash}#${row.utxo_index}`;
    setActionUtxo(utxoRef);
    try {
      await approveScholarship(utxoRef);
      invalidate();
    } catch {
      /* handled */
    } finally {
      setActionUtxo(null);
    }
  };

  const handleRevoke = async (reason: string) => {
    if (!revokeTarget) return;
    const utxoRef = `${revokeTarget.utxo_hash}#${revokeTarget.utxo_index}`;
    setActionUtxo(utxoRef);
    try {
      await revokeScholarship(utxoRef, reason);
      setRevokeTarget(null);
      invalidate();
    } catch {
      /* handled */
    } finally {
      setActionUtxo(null);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Học bổng chờ duyệt
          </h2>
          <p className="text-sm text-zinc-500">
            {data?.length ?? 0} học bổng PENDING
          </p>
        </div>
        {step !== "idle" && (
          <button
            type="button"
            onClick={reset}
            disabled={isBusy}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Reset trạng thái
          </button>
        )}
      </div>

      <div className="mt-4">
        <TxStatusBanner step={step} label={stepLabel} txHash={lastTxHash} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-zinc-500" />
        </div>
      ) : !data?.length ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          Không có học bổng đang chờ duyệt.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                <th className="py-2 pr-4 font-medium">Mã SV</th>
                <th className="py-2 pr-4 font-medium">Học kỳ</th>
                <th className="py-2 pr-4 font-medium">GPA</th>
                <th className="py-2 pr-4 font-medium">Số tiền</th>
                <th className="py-2 pr-4 font-medium">Trạng thái</th>
                <th className="py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const utxoRef = `${row.utxo_hash}#${row.utxo_index}`;
                const rowBusy = isBusy && actionUtxo === utxoRef;

                return (
                  <tr
                    key={utxoRef}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/20"
                  >
                    <td className="py-3 pr-4 font-medium text-zinc-100">
                      {row.student_id}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{row.semester}</td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {row.required_gpa.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-emerald-400">
                      {lovelaceToAda(row.scholarship_amount, { prefix: true })}
                    </td>
                    <td className="py-3 pr-4">
                      <ScholarshipStatusBadge status={row.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(row)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {rowBusy && step !== "idle" ? (
                            <Loader2 className="inline size-3 animate-spin" />
                          ) : null}{" "}
                          Duyệt
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setRevokeTarget(row)}
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Thu hồi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RevokeModal
        scholarship={revokeTarget}
        open={!!revokeTarget}
        isSubmitting={isBusy}
        onClose={() => !isBusy && setRevokeTarget(null)}
        onConfirm={handleRevoke}
      />
    </section>
  );
}
