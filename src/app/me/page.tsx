"use client";

import { useWalletStore } from "@/stores/use-wallet-store";
import { useQuery } from "@tanstack/react-query";
import { getMyScholarship } from "@/lib/api";
import { buildClaimTx, submitSignedTx } from "@/lib/api";
import { lovelaceToAda, shortenAddress } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, ScholarshipStatus } from "@/types";
import { GraduationCap, Wallet, Loader2, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function MePage() {
  const { isConnected, walletAddress, signTx } = useWalletStore();
  const [claimingUtxo, setClaimingUtxo] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { data: scholarships, isLoading, refetch } = useQuery({
    queryKey: ["myScholarship", walletAddress],
    queryFn: () => getMyScholarship(walletAddress!),
    enabled: !!walletAddress,
  });

  const handleClaim = async (utxoHash: string, utxoIndex: number) => {
    const utxoRef = `${utxoHash}#${utxoIndex}`;
    setClaimingUtxo(utxoRef);
    setClaimError(null);
    try {
      // 1. Build unsigned tx from backend
      const { unsigned_tx_cbor } = await buildClaimTx(utxoRef, { wallet_address: walletAddress! });
      // 2. Sign with browser wallet
      const signedCbor = await signTx(unsigned_tx_cbor);
      // 3. Submit through backend
      const result = await submitSignedTx(signedCbor);
      setTxHash(result.tx_hash);
      refetch();
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaimingUtxo(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
          <Wallet size={28} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Connect Your Wallet</h2>
        <p className="mt-2 text-gray-500">Connect your wallet to view your scholarships.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Scholarship</h1>
        <p className="mt-1 font-mono text-sm text-gray-500">{walletAddress}</p>
      </div>

      {txHash && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
          <CheckCircle size={16} />
          <div>
            <p className="font-medium">Claim submitted!</p>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs hover:underline"
            >
              {txHash.slice(0, 24)}... <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      {claimError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          <AlertCircle size={16} />
          {claimError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : !scholarships?.length ? (
        <div className="card-glass flex flex-col items-center justify-center py-20 text-gray-600">
          <GraduationCap size={36} className="mb-3 opacity-30" />
          <p>No scholarships found for your wallet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scholarships.map((s) => (
            <div key={`${s.utxo_hash}#${s.utxo_index}`} className="card-glass p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status as ScholarshipStatus]}`}>
                      {STATUS_LABELS[s.status as ScholarshipStatus]}
                    </span>
                    <span className="text-xs text-gray-500">Semester: {s.semester}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">₳ {lovelaceToAda(s.scholarship_amount)}</p>
                  <p className="text-xs text-gray-500">
                    UTxO: <span className="font-mono">{shortenAddress(s.utxo_hash, 16)}#{s.utxo_index}</span>
                  </p>
                  <p className="text-xs text-gray-500">Min GPA: {s.required_gpa.toFixed(2)}</p>
                </div>

                {s.status === ScholarshipStatus.APPROVED && (
                  <button
                    onClick={() => handleClaim(s.utxo_hash, s.utxo_index)}
                    disabled={claimingUtxo !== null}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {claimingUtxo === `${s.utxo_hash}#${s.utxo_index}` ? (
                      <><Loader2 size={14} className="animate-spin" /> Signing...</>
                    ) : (
                      "Claim Scholarship"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
