"use client";

import { useWalletStore } from "@/stores/use-wallet-store";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function NetworkWarningBanner() {
  const { networkWarning } = useWalletStore();
  const [dismissed, setDismissed] = useState(false);

  if (!networkWarning || dismissed) return null;

  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-300">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          <strong>Wrong Network:</strong> Vui lòng chuyển sang <strong>Preprod Testnet</strong> trong cài đặt ví của bạn.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 hover:bg-orange-500/20 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
