"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { NetworkGuard, WalletConnectButton } from "@/components/wallet";
import {
  splitScholarships,
  studentKeys,
  useStudentDashboard,
} from "@/hooks/use-student-dashboard";
import { useStudentClaimFlow } from "@/hooks/use-student-claim-flow";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/use-wallet-store";

import { ScholarshipCard } from "./scholarship-card";
import { ScholarshipHistoryList } from "./scholarship-history-list";

type Tab = "current" | "history";

export function StudentDashboard() {
  const isConnected = useWalletStore((s) => s.isConnected);
  const address = useWalletStore((s) => s.walletAddress);
  const [tab, setTab] = useState<Tab>("current");
  const [claimingRef, setClaimingRef] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useStudentDashboard(address);
  const {
    step,
    stepLabel,
    lastTxHash,
    isBusy,
    claimScholarship,
    reset,
  } = useStudentClaimFlow();

  const { active, history } = splitScholarships(data?.scholarships ?? []);
  const claimable = active.filter((s) => s.status === 1);
  const pending = active.filter((s) => s.status === 0);
  const currentGpa = data?.profile?.gpa;

  const handleClaim = async (scholarship: (typeof active)[0]) => {
    const utxoRef = `${scholarship.utxo_hash}#${scholarship.utxo_index}`;
    setClaimingRef(utxoRef);
    try {
      await claimScholarship(utxoRef);
      await queryClient.invalidateQueries({
        queryKey: studentKeys.dashboard(address ?? ""),
      });
      refetch();
    } catch {
      /* toast in hook */
    } finally {
      setClaimingRef(null);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-50">Sinh viên</h1>
            <p className="text-sm text-zinc-400">Học bổng của tôi</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Trang chủ
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <NetworkGuard />

        {!isConnected || !address ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-700 py-16 text-center">
            <Wallet className="size-10 text-zinc-600" />
            <p className="text-sm text-zinc-400">
              Kết nối ví để xem học bổng của bạn
            </p>
            <WalletConnectButton />
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </div>
        ) : isError ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error instanceof Error ? error.message : "Không tải được dữ liệu"}
          </p>
        ) : (
          <>
            {data?.profile && (
              <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                <p className="text-sm text-zinc-300">
                  Xin chào, <strong>{data.profile.name}</strong>
                </p>
                <p className="text-xs text-zinc-500">
                  GPA hệ thống: {data.profile.gpa.toFixed(2)}
                </p>
              </div>
            )}

            <div className="mb-6 flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
              {(
                [
                  { id: "current" as const, label: "Hiện tại" },
                  { id: "history" as const, label: "Lịch sử" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                    tab === id
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {label}
                  {id === "history" && history.length > 0 && (
                    <span className="ml-1.5 text-xs text-zinc-500">
                      ({history.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {tab === "current" ? (
              active.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center">
                  <p className="text-base text-zinc-300">
                    Bạn chưa có học bổng trong kỳ này
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Liên hệ phòng đào tạo nếu bạn cho rằng đây là nhầm lẫn.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {claimable.map((s) => {
                    const utxoRef = `${s.utxo_hash}#${s.utxo_index}`;
                    const isThisClaim =
                      isBusy && claimingRef === utxoRef;

                    return (
                      <ScholarshipCard
                        key={utxoRef}
                        scholarship={s}
                        currentGpa={currentGpa}
                        onClaim={() => handleClaim(s)}
                        claimStep={isThisClaim ? step : "idle"}
                        claimLabel={isThisClaim ? stepLabel : ""}
                        claimTxHash={isThisClaim ? lastTxHash : null}
                        isClaimBusy={isBusy}
                      />
                    );
                  })}
                  {pending.map((s) => (
                    <ScholarshipCard
                      key={`${s.utxo_hash}#${s.utxo_index}`}
                      scholarship={s}
                      currentGpa={currentGpa}
                    />
                  ))}
                </div>
              )
            ) : (
              <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h2 className="mb-4 text-sm font-medium text-zinc-400">
                  Các kỳ đã nhận học bổng
                </h2>
                <ScholarshipHistoryList items={history} />
              </section>
            )}

            {step === "success" && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng trạng thái giao dịch
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
