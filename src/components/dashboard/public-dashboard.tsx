"use client";

import { NetworkGuard } from "@/components/wallet";

import { ScholarshipsTable } from "./scholarships-table";
import { StatsCards } from "./stats-cards";
import { TimelineFeed } from "./timeline-feed";

export function PublicDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <NetworkGuard />
      <StatsCards />
      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <ScholarshipsTable />
        <TimelineFeed />
      </div>
    </div>
  );
}
