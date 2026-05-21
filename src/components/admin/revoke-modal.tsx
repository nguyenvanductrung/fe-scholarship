"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ScholarshipInfo } from "@/types/api";

export function RevokeModal({
  scholarship,
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  scholarship: ScholarshipInfo | null;
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open || !scholarship) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/70"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div
        role="dialog"
        className="relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
        >
          <X className="size-5" />
        </button>

        <h3 className="text-lg font-semibold text-zinc-50">Thu hồi học bổng</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Mã SV: <strong className="text-zinc-200">{scholarship.student_id}</strong>{" "}
          · {scholarship.semester}
        </p>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-zinc-400">Lý do thu hồi</span>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            placeholder="Nhập lý do..."
            className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSubmitting || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50",
            )}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Xác nhận thu hồi
          </button>
        </div>
      </div>
    </div>
  );
}
