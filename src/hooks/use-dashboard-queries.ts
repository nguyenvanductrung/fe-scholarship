"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchScholarships, fetchStats, fetchTransactions } from "@/lib/api";

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  scholarships: (page: number, size: number, studentId: string) =>
    ["dashboard", "scholarships", page, size, studentId] as const,
  transactions: ["dashboard", "transactions"] as const,
};

export function useStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: fetchStats,
    staleTime: 30_000,
  });
}

export function useScholarshipsQuery(
  page: number,
  size: number,
  studentId: string,
) {
  return useQuery({
    queryKey: dashboardKeys.scholarships(page, size, studentId),
    queryFn: () =>
      fetchScholarships({
        page,
        size,
        ...(studentId.trim() ? { student_id: studentId.trim() } : {}),
      }),
    placeholderData: (prev) => prev,
  });
}

export function useTransactionsQuery() {
  return useQuery({
    queryKey: dashboardKeys.transactions,
    queryFn: fetchTransactions,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
