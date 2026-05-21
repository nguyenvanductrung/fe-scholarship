"use client";

import { useQuery } from "@tanstack/react-query";
import { getScholarships, getStats } from "@/lib/api";
import { useWalletStore } from "@/stores/use-wallet-store";
import { shortenAddress, lovelaceToAda } from "@/lib/utils";
import {
  GraduationCap, Coins, CheckCircle, Clock, TrendingUp, Shield, Wallet
} from "lucide-react";
import { ScholarshipStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isConnected, walletAddress, isAdmin } = useWalletStore();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 60_000,
  });

  const { data: recentScholarships } = useQuery({
    queryKey: ["scholarships", 1, 5],
    queryFn: () => getScholarships(1, 5),
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-purple-950/40 to-gray-950 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Cardano Preprod Testnet
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white md:text-5xl">
            Scholarship Management <br />
            <span className="text-gradient">On-Chain</span>
          </h1>
          <p className="mt-3 max-w-xl text-gray-400">
            Quản lý học bổng minh bạch trên blockchain Cardano. Admin duyệt học bổng, sinh viên nhận học bổng qua ví Eternl/Nami.
          </p>
          {!isConnected && (
            <p className="mt-4 text-sm text-violet-400">
              ↑ Kết nối ví để bắt đầu
            </p>
          )}
          {isConnected && isAdmin && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
              <Shield size={14} />
              Admin mode · {shortenAddress(walletAddress!)}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Overview</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Funded"
            value={`₳ ${stats ? lovelaceToAda(stats.total_funded_lovelace) : "—"}`}
            icon={Coins}
            color="bg-violet-500/20 text-violet-400"
          />
          <StatCard
            label="Pending"
            value={stats?.total_pending ?? "—"}
            icon={Clock}
            color="bg-yellow-500/20 text-yellow-400"
          />
          <StatCard
            label="Approved"
            value={stats?.total_approved ?? "—"}
            icon={CheckCircle}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            label="Claimed"
            value={stats?.total_claimed ?? "—"}
            icon={TrendingUp}
            color="bg-blue-500/20 text-blue-400"
          />
        </div>
      </section>

      {/* Recent Scholarships */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Recent Scholarships</h2>
          <a href="/scholarships" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="card-glass overflow-hidden">
          {!recentScholarships?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <GraduationCap size={36} className="mb-3 opacity-30" />
              <p>No scholarships yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-600">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {recentScholarships.data.map((s) => (
                  <tr key={`${s.utxo_hash}#${s.utxo_index}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {shortenAddress(s.student_pkh)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{s.semester}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      ₳ {lovelaceToAda(s.scholarship_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[s.status as ScholarshipStatus]}`}>
                        {STATUS_LABELS[s.status as ScholarshipStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
