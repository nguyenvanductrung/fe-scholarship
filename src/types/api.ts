export type ScholarshipStatus = 0 | 1 | 2 | 3;

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

export interface PaginatedScholarships {
  data: ScholarshipInfo[];
  total: number;
  page: number;
  size: number;
}

export interface Stats {
  total_funded_lovelace: number;
  total_approved: number;
  total_claimed: number;
  total_pending: number;
  total_disbursed_lovelace: number;
}

export type TxType = "fund" | "approve" | "claim" | "revoke";

export interface UnsignedTxResponse {
  unsigned_tx_cbor: string;
  tx_hash: string;
}

export interface TxResponse {
  tx_hash: string;
}

export interface BuildFundTxPayload {
  student_id: string;
  student_address: string;
  required_gpa: number;
  amount_ada: number;
  semester: string;
  admin_wallet_address: string;
}

export interface BuildApproveTxPayload {
  admin_wallet_address: string;
}

export interface BuildRevokeTxPayload {
  admin_wallet_address: string;
  reason: string;
}

export interface BuildClaimTxPayload {
  wallet_address: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  gpa: number;
  pkh: string;
}

export interface StudentDashboardResponse {
  profile: StudentProfile | null;
  scholarships: ScholarshipInfo[];
}

export interface TxDetail {
  tx_hash: string;
  block: string;
  block_height: number;
  slot: number;
  block_time?: number;
  fees: string;
  size: number;
  tx_type?: TxType | string;
  inputs: Record<string, unknown>[];
  outputs: Record<string, unknown>[];
}
