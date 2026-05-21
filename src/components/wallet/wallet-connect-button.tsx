"use client";

import { useWalletList } from "@meshsdk/react";
import { cva } from "class-variance-authority";
import {
  ChevronDown,
  Loader2,
  LogOut,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn, lovelaceToAda, shortenAddress } from "@/lib/utils";
import { useWalletStore } from "@/stores/use-wallet-store";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export function WalletConnectButton() {
  const wallets = useWalletList();
  const {
    walletAddress,
    walletName,
    adaBalance,
    isConnected,
    isConnecting,
    isAdmin,
    connect,
    disconnect,
  } = useWalletStore();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = useCallback(
    async (name: string) => {
      setError(null);
      setOpen(false);
      try {
        await connect(name);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể kết nối ví",
        );
      }
    },
    [connect],
  );

  const handleDisconnect = useCallback(() => {
    setError(null);
    setOpen(false);
    disconnect();
  }, [disconnect]);

  if (isConnected && walletAddress) {
    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            buttonVariants(),
            "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
          )}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {walletName && (
            <span className="max-w-[80px] truncate text-zinc-400">
              {walletName}
            </span>
          )}
          <span className="font-mono text-zinc-50">
            {shortenAddress(walletAddress)}
          </span>
          <span className="text-emerald-400">
            {lovelaceToAda(adaBalance ?? undefined)} ADA
          </span>
          {isAdmin && (
            <span className="rounded bg-violet-600/30 px-1.5 py-0.5 text-xs text-violet-300">
              Admin
            </span>
          )}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 min-w-[220px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
          >
            <div className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
              <p className="truncate font-mono text-zinc-300">{walletAddress}</p>
              <p className="mt-1">
                Số dư:{" "}
                <span className="text-emerald-400">
                  {lovelaceToAda(adaBalance ?? undefined)} ADA
                </span>
              </p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleDisconnect}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
            >
              <LogOut className="size-4" />
              Ngắt kết nối
            </button>
          </div>
        )}

        {error && (
          <p className="absolute right-0 mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isConnecting}
        className={cn(
          buttonVariants(),
          "bg-emerald-600 text-white hover:bg-emerald-500",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {isConnecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wallet className="size-4" />
        )}
        {isConnecting ? "Đang kết nối..." : "Kết nối ví"}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[240px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
        >
          {wallets.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-zinc-400">
              Không tìm thấy ví Cardano (Eternl, Nami, Lace…). Hãy cài extension
              và tải lại trang.
            </p>
          ) : (
            wallets.map((w) => (
              <button
                key={w.name}
                type="button"
                role="menuitem"
                onClick={() => handleConnect(w.name)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-zinc-100 hover:bg-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-md"
                />
                <span>{w.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="absolute right-0 mt-1 max-w-xs text-right text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
