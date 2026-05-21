"use client";

import { useNetwork } from "@meshsdk/react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/use-wallet-store";

const MAINNET_ID = 1;

export function NetworkGuard({ className }: { className?: string }) {
  const networkId = useNetwork();
  const isConnected = useWalletStore((s) => s.isConnected);

  if (!isConnected || networkId !== MAINNET_ID) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200",
        className,
      )}
    >
      <AlertTriangle className="size-5 shrink-0 text-amber-400" aria-hidden />
      <p>
        Vui lòng chuyển sang <strong>Preprod testnet</strong> trong ví của bạn.
        Ứng dụng này chỉ hỗ trợ testnet (network id 0).
      </p>
    </div>
  );
}
