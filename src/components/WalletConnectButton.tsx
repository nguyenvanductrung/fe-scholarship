"use client";

import { useState, useRef, useEffect } from "react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { BrowserWallet } from "@meshsdk/core";
import { shortenAddress, cn } from "@/lib/utils";
import { Wallet, ChevronDown, AlertTriangle, LogOut, Copy, Check, Loader2 } from "lucide-react";

// Known wallet icon fallbacks
const WALLET_ICONS: Record<string, string> = {
  eternl: "https://eternl.io/icons/favicon-32x32.png",
  nami: "https://namiwallet.io/favicon-32x32.png",
  lace: "https://www.lace.io/favicon-32x32.png",
  flint: "https://flint-wallet.com/favicon.ico",
  typhon: "https://typhonwallet.io/assets/typhon.svg",
  vespr: "https://vespr.xyz/favicon.ico",
};

export function WalletConnectButton() {
  const {
    walletAddress,
    walletName,
    balance,
    isConnected,
    isConnecting,
    networkWarning,
    error,
    connect,
    disconnect,
  } = useWalletStore();

  const [availableWallets, setAvailableWallets] = useState<{ name: string; icon?: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect wallets on mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const wallets = await BrowserWallet.getAvailableWallets();
        setAvailableWallets(wallets.map((w) => ({ name: w.name, icon: w.icon })));
      } catch {
        // SSR / window not available
      }
    };
    fetchWallets();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- Connected State ---
  if (isConnected && walletAddress) {
    return (
      <div className="relative" ref={dropdownRef}>
        {/* Network Warning Banner */}
        {networkWarning && (
          <div className="absolute -top-10 left-0 right-0 flex items-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-400">
            <AlertTriangle size={12} />
            Vui lòng chuyển sang Preprod testnet
          </div>
        )}

        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
            networkWarning
              ? "border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          )}
        >
          {walletName && (
            <img
              src={WALLET_ICONS[walletName.toLowerCase()] ?? ""}
              alt={walletName}
              className="h-4 w-4 rounded-sm object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <span className="max-w-[120px] truncate font-mono text-xs">
            {shortenAddress(walletAddress)}
          </span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs">
            ₳ {balance ?? "0"}
          </span>
          <ChevronDown size={12} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-xs text-gray-400">Connected via {walletName}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-mono text-xs text-white">{shortenAddress(walletAddress, 12)}</p>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-lg font-bold text-white">₳ {balance ?? "0"}</p>
            </div>

            {/* Disconnect */}
            <button
              onClick={() => { disconnect(); setDropdownOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Disconnected State ---
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        disabled={isConnecting}
        className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isConnecting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Wallet size={14} />
        )}
        {isConnecting ? "Connecting..." : "Connect Wallet"}
        {!isConnecting && <ChevronDown size={12} className={cn("transition-transform", dropdownOpen && "rotate-180")} />}
      </button>

      {/* Wallet Picker Dropdown */}
      {dropdownOpen && !isConnecting && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
          {availableWallets.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              <Wallet size={24} className="mx-auto mb-2 opacity-30" />
              No wallets detected.<br />
              Install Eternl or Nami.
            </div>
          ) : (
            availableWallets.map((w) => (
              <button
                key={w.name}
                onClick={() => { connect(w.name); setDropdownOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5"
              >
                {w.icon ? (
                  <img src={w.icon} alt={w.name} className="h-6 w-6 rounded-md object-contain" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20">
                    <Wallet size={12} className="text-violet-400" />
                  </div>
                )}
                <span className="capitalize">{w.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="absolute left-0 top-full mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
