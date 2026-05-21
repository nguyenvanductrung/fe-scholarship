import { History } from "lucide-react";

import { ScholarshipStatusBadge } from "@/components/dashboard/scholarship-status-badge";
import { formatSemester } from "@/hooks/use-student-dashboard";
import { getCardanoScanTxUrl, lovelaceToAda } from "@/lib/utils";
import type { ScholarshipInfo } from "@/types/api";

export function ScholarshipHistoryList({
  items,
}: {
  items: ScholarshipInfo[];
}) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Chưa có học bổng đã nhận ở các kỳ trước.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => (
        <li
          key={`${s.utxo_hash}#${s.utxo_index}`}
          className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <History className="size-4 shrink-0 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-100">
                Học kỳ {formatSemester(s.semester)}
              </p>
              <p className="text-xs text-zinc-500">
                {lovelaceToAda(s.scholarship_amount, { prefix: true })} · GPA{" "}
                {s.required_gpa.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-7 sm:pl-0">
            <ScholarshipStatusBadge status={s.status} />
            <a
              href={getCardanoScanTxUrl(s.utxo_hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-sky-400 hover:underline"
            >
              {s.utxo_hash.slice(0, 8)}…
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
