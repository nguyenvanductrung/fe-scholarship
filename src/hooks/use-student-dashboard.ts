"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchStudentDashboard } from "@/lib/api";
import type { ScholarshipInfo } from "@/types/api";

export const studentKeys = {
  dashboard: (address: string) => ["student", "dashboard", address] as const,
};

export function useStudentDashboard(walletAddress: string | null) {
  return useQuery({
    queryKey: studentKeys.dashboard(walletAddress ?? ""),
    queryFn: () => fetchStudentDashboard(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 15_000,
  });
}

export function splitScholarships(scholarships: ScholarshipInfo[]) {
  const active = scholarships.filter((s) => s.status !== 2);
  const history = scholarships.filter((s) => s.status === 2);
  return { active, history };
}

export function formatSemester(semester: string): string {
  return semester.replace(/_/g, "-");
}
