"use client";

import { NetworkGuard } from "@/components/wallet";

import { AdminGuard } from "./admin-guard";
import { CreateScholarshipForm } from "./create-scholarship-form";
import { PendingScholarships } from "./pending-scholarships";

export function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Quan ly hoc bong on-chain
          </p>
        </div>
        <NetworkGuard />
        <CreateScholarshipForm />
        <PendingScholarships />
      </div>
    </AdminGuard>
  );
}
