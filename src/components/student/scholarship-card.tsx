"use client";

import { GraduationCap, Loader2 } from "lucide-react";

import { ScholarshipStatusBadge } from "@/components/dashboard/scholarship-status-badge";
import { TxStatusBanner } from "@/components/admin/tx-status-banner";
import type { TxFlowStep } from "@/hooks/use-student-claim-flow";
import { formatSemester } from "@/hooks/use-student-dashboard";
import { lovelaceToAda } from "@/lib/utils";
import type { ScholarshipInfo } from "@/types/api";

import { GpaProgressBar } from "./gpa-progress-bar";

const APPROVED_LABEL = "Đã được duyệt";

export function ScholarshipCard({
  scholarship,
  currentGpa,
  onClaim,
  claimStep,
  claimLabel,
  claimTxHash,
  isClaimBusy,
}: {
  scholarship: ScholarshipInfo;
  currentGpa?: number;
  onClaim?: () => void;
  claimStep?: TxFlowStep;
  claimLabel?: string;
  claimTxHash?: string | null;
  isClaimBusy?: boolean;
}) {
  const canClaim = scholarship.status === 1;
  const showApprovedLabel = scholarship.status === 1;

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
          <GraduationCap className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-zinc-50">
            Học bổng Học kỳ {formatSemester(scholarship.semester)}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Mã SV: {scholarship.student_id}</p>
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-400">Số tiền</dt>
          <dd className="font-mono font-medium text-emerald-400">
            {lovelaceToAda(scholarship.scholarship_amount, { prefix: true })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-400">GPA yêu cầu</dt>
          <dd className="text-zinc-100">{scholarship.required_gpa.toFixed(1)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-zinc-400">Trạng thái</dt>
          <dd>
            {showApprovedLabel ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
                <span aria-hidden>✅</span>
                {APPROVED_LABEL}
              </span>
            ) : (
              <ScholarshipStatusBadge status={scholarship.status} />
            )}
          </dd>
        </div>
      </dl>

      {currentGpa !== undefined && (
        <GpaProgressBar
          className="mt-5"
          currentGpa={currentGpa}
          requiredGpa={scholarship.required_gpa}
        />
      )}

      {canClaim && onClaim && (
        <div className="mt-6 space-y-3">
          {claimStep && claimStep !== "idle" && claimLabel && (
            <TxStatusBanner
              step={claimStep}
              label={claimLabel}
              txHash={claimTxHash ?? null}
            />
          )}
          <button
            type="button"
            onClick={onClaim}
            disabled={isClaimBusy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isClaimBusy && <Loader2 className="size-4 animate-spin" />}
            Nhận học bổng ngay
          </button>
        </div>
      )}

      {scholarship.status === 0 && (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Học bổng đang chờ admin duyệt. Bạn sẽ nhận được thông báo khi đã duyệt.
        </p>
      )}
    </article>
  );
}
