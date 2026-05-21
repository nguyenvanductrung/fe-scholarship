import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ScholarshipStatus } from "@/types/api";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        pending: "bg-amber-500/15 text-amber-300",
        approved: "bg-emerald-500/15 text-emerald-300",
        claimed: "bg-sky-500/15 text-sky-300",
        revoked: "bg-red-500/15 text-red-300",
      },
    },
  },
);

const STATUS_MAP: Record<
  ScholarshipStatus,
  { label: string; emoji: string; variant: "pending" | "approved" | "claimed" | "revoked" }
> = {
  0: { label: "Chờ duyệt", emoji: "🟡", variant: "pending" },
  1: { label: "Đã duyệt", emoji: "🟢", variant: "approved" },
  2: { label: "Đã nhận", emoji: "✅", variant: "claimed" },
  3: { label: "Thu hồi", emoji: "🔴", variant: "revoked" },
};

export function ScholarshipStatusBadge({
  status,
}: {
  status: ScholarshipStatus;
}) {
  const config = STATUS_MAP[status] ?? STATUS_MAP[0];

  return (
    <span className={cn(badgeVariants({ status: config.variant }))}>
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </span>
  );
}
