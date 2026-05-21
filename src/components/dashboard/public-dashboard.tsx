"use client";

import Link from "next/link";

import { NetworkGuard, WalletConnectButton } from "@/components/wallet";
import { useWalletStore } from "@/stores/use-wallet-store";

import { ScholarshipsTable } from "./scholarships-table";
import { StatsCards } from "./stats-cards";
import { TimelineFeed } from "./timeline-feed";

export function PublicDashboard() {
  const isAdmin = useWalletStore((s) => s.isAdmin);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-50">Pycardano</h1>
            <p className="text-sm text-zinc-400">
              Public Dashboard · Preprod testnet
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Sinh viên
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/20"
              >
                Admin
              </Link>
            )}
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <NetworkGuard />
        <StatsCards />
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <ScholarshipsTable />
          <TimelineFeed />
        </div>
      </main>
    </div>
  );
}
