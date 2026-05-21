"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useWalletStore } from "@/stores/use-wallet-store";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isConnected = useWalletStore((s) => s.isConnected);
  const isAdmin = useWalletStore((s) => s.isAdmin);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isConnected || !isAdmin) {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [isConnected, isAdmin, router]);

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
        <p className="text-sm">Đang xác thực quyền admin...</p>
      </div>
    );
  }

  return <>{children}</>;
}
