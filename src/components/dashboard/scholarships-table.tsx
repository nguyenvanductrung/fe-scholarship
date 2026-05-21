"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useScholarshipsQuery } from "@/hooks/use-dashboard-queries";
import { getCardanoScanTxUrl, lovelaceToAda } from "@/lib/utils";
import type { ScholarshipInfo } from "@/types/api";

import { ScholarshipStatusBadge } from "./scholarship-status-badge";
import { TableSkeleton } from "./skeletons";

const PAGE_SIZE = 10;

export function ScholarshipsTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error } = useScholarshipsQuery(
    page,
    PAGE_SIZE,
    search,
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Bảng học bổng
          </h2>
          <p className="text-sm text-zinc-500">
            {data ? `${data.total} học bổng trên contract` : "Đang tải..."}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Tìm theo mã SV..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 sm:p-6">
          <TableSkeleton />
        </div>
      ) : isError ? (
        <p className="px-6 py-8 text-sm text-red-400">
          {error instanceof Error ? error.message : "Không tải được dữ liệu"}
        </p>
      ) : (
        <>
          <div
            className={`overflow-x-auto ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium sm:px-6">Mã SV</th>
                  <th className="px-4 py-3 font-medium">Học kỳ</th>
                  <th className="px-4 py-3 font-medium">GPA yêu cầu</th>
                  <th className="px-4 py-3 font-medium">Số tiền</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-zinc-500"
                    >
                      Không có học bổng phù hợp.
                    </td>
                  </tr>
                ) : (
                  data?.data.map((row) => (
                    <ScholarshipRow key={`${row.utxo_hash}#${row.utxo_index}`} row={row} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-zinc-800 px-4 py-3 sm:px-6">
            <p className="text-xs text-zinc-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                Sau
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ScholarshipRow({ row }: { row: ScholarshipInfo }) {
  const txRef = `${row.utxo_hash}#${row.utxo_index}`;

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
      <td className="px-4 py-3 font-medium text-zinc-100 sm:px-6">
        {row.student_id}
      </td>
      <td className="px-4 py-3 text-zinc-300">{row.semester}</td>
      <td className="px-4 py-3 text-zinc-300">{row.required_gpa.toFixed(2)}</td>
      <td className="px-4 py-3 font-mono text-emerald-400">
        {lovelaceToAda(row.scholarship_amount, { prefix: true })}
      </td>
      <td className="px-4 py-3">
        <ScholarshipStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 sm:px-6">
        <a
          href={getCardanoScanTxUrl(row.utxo_hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-sky-400 hover:text-sky-300 hover:underline"
          title={txRef}
        >
          {row.utxo_hash.slice(0, 8)}…{row.utxo_hash.slice(-6)}
        </a>
      </td>
    </tr>
  );
}
