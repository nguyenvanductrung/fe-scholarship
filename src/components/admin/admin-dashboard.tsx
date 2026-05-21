"use client";

import Link from "next/link";

import { NetworkGuard, WalletConnectButton } from "@/components/wallet";

import { AdminGuard } from "./admin-guard";
import { CreateScholarshipForm } from "./create-scholarship-form";
import { PendingScholarships } from "./pending-scholarships";

export function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-lg font-semibold text-zinc-50">Admin Panel</h1>
              <p className="text-sm text-zinc-400">
                Quản lý học bổng on-chain
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-zinc-200"
              >
                ← Dashboard
              </Link>
              <WalletConnectButton />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
          <NetworkGuard />
          <CreateScholarshipForm />
          <PendingScholarships />
        </main>
      </div>
    </AdminGuard>
  );
}
