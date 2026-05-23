"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wallet } from "lucide-react";
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
  const { data, isLoading, isError, error, refetch } =
    useStudentDashboard(address);
  const { step, stepLabel, lastTxHash, isBusy, claimScholarship, reset } =
    useStudentClaimFlow();

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
      // Toast is handled in the claim hook.
    } finally {
      setClaimingRef(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Sinh vien</h1>
        <p className="mt-1 text-sm text-zinc-400">Hoc bong cua toi</p>
      </div>

      <NetworkGuard />

      {!isConnected || !address ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-700 py-16 text-center">
          <Wallet className="size-10 text-zinc-600" />
          <p className="text-sm text-zinc-400">
            Ket noi vi de xem hoc bong cua ban
          </p>
          <WalletConnectButton />
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error instanceof Error ? error.message : "Khong tai duoc du lieu"}
        </p>
      ) : (
        <>
          {data?.profile && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <p className="text-sm text-zinc-300">
                Xin chao, <strong>{data.profile.name}</strong>
              </p>
              <p className="text-xs text-zinc-500">
                GPA he thong: {data.profile.gpa.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
            {(
              [
                { id: "current" as const, label: "Hien tai" },
                { id: "history" as const, label: "Lich su" },
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
                  Ban chua co hoc bong trong ky nay
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Lien he phong dao tao neu ban cho rang day la nham lan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {claimable.map((s) => {
                  const utxoRef = `${s.utxo_hash}#${s.utxo_index}`;
                  const isThisClaim = isBusy && claimingRef === utxoRef;

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
                Cac ky da nhan hoc bong
              </h2>
              <ScholarshipHistoryList items={history} />
            </section>
          )}

          {step === "success" && (
            <button
              type="button"
              onClick={reset}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
            >
              Dong trang thai giao dich
            </button>
          )}
        </>
      )}
    </div>
  );
}
