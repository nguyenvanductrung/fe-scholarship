"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { buildClaimTx, submitSignedTx } from "@/lib/api";
import { getCardanoScanTxUrl } from "@/lib/utils";
import { useWalletStore } from "@/stores/use-wallet-store";

export type TxFlowStep =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "success"
  | "error";

const STEP_LABELS: Record<TxFlowStep, string> = {
  idle: "",
  building: "Đang build transaction...",
  signing: "Vui lòng ký trong ví...",
  submitting: "Đang submit...",
  success: "✅ Thành công!",
  error: "Đã xảy ra lỗi",
};

export function useStudentClaimFlow() {
  const [step, setStep] = useState<TxFlowStep>("idle");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const signTx = useWalletStore((s) => s.signTx);
  const walletAddress = useWalletStore((s) => s.walletAddress);

  const claimScholarship = useCallback(
    async (utxoRef: string) => {
      if (!walletAddress) {
        toast.error("Vui lòng kết nối ví");
        throw new Error("Wallet not connected");
      }

      setLastTxHash(null);
      try {
        setStep("building");
        const { unsigned_tx_cbor } = await buildClaimTx(utxoRef, {
          wallet_address: walletAddress,
        });

        setStep("signing");
        const signedCbor = await signTx(unsigned_tx_cbor);

        setStep("submitting");
        const { tx_hash } = await submitSignedTx(signedCbor);
        setLastTxHash(tx_hash);
        setStep("success");

        toast.success("Nhận học bổng thành công!", {
          description: getCardanoScanTxUrl(tx_hash),
          action: {
            label: "CardanoScan",
            onClick: () => window.open(getCardanoScanTxUrl(tx_hash), "_blank"),
          },
          duration: 10_000,
        });

        return tx_hash;
      } catch (err) {
        setStep("error");
        const message =
          err instanceof Error ? err.message : "Nhận học bổng thất bại";
        toast.error(message);
        throw err;
      }
    },
    [signTx, walletAddress],
  );

  const reset = useCallback(() => {
    setStep("idle");
    setLastTxHash(null);
  }, []);

  return {
    step,
    stepLabel: STEP_LABELS[step],
    lastTxHash,
    isBusy: ["building", "signing", "submitting"].includes(step),
    claimScholarship,
    reset,
  };
}
