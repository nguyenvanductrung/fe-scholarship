// Centralized TypeScript types for the scholarship DApp

export interface ScholarshipInfo {
  utxo_hash: string;
  utxo_index: number;
  student_pkh: string;
  student_id: string;
  required_gpa: number;
  scholarship_amount: number;
  admin_pkh: string;
  status: ScholarshipStatus;
  semester: string;
}

export enum ScholarshipStatus {
  PENDING = 0,
  APPROVED = 1,
  CLAIMED = 2,
}

export const STATUS_LABELS: Record<ScholarshipStatus, string> = {
  [ScholarshipStatus.PENDING]: "Pending",
  [ScholarshipStatus.APPROVED]: "Approved",
  [ScholarshipStatus.CLAIMED]: "Claimed",
};

export const STATUS_COLORS: Record<ScholarshipStatus, string> = {
  [ScholarshipStatus.PENDING]: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  [ScholarshipStatus.APPROVED]: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  [ScholarshipStatus.CLAIMED]: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export interface PaginatedScholarships {
  data: ScholarshipInfo[];
  total: number;
  page: number;
  size: number;
}

export interface Stats {
  total_funded_lovelace: number;
  total_disbursed_lovelace: number;
  total_approved: number;
  total_claimed: number;
  total_pending: number;
}

export interface StudentInfo {
  id: string;
  name: string;
  pkh: string;
  gpa: number;
}

export interface TxResponse {
  tx_hash: string;
}

export interface UnsignedTxResponse {
  unsigned_tx_cbor: string;
  tx_hash: string;
}

export interface WalletInfo {
  name: string;
  icon: string;
  version: string;
}
