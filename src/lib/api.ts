import axios from "axios";
import type {
  ScholarshipInfo,
  PaginatedScholarships,
  Stats,
  TxResponse,
  UnsignedTxResponse,
} from "@/types";
import type {
  BuildFundTxPayload,
  BuildApproveTxPayload,
  BuildRevokeTxPayload,
  BuildClaimTxPayload,
} from "@/types/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Inject JWT token for admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- AUTH ---
export const loginAdmin = async (username: string, password: string): Promise<string> => {
  const res = await api.post("/admin/login", { username, password });
  return res.data.access_token;
};

// --- SCHOLARSHIPS (Public) ---
export const getScholarships = async (page = 1, size = 10): Promise<PaginatedScholarships> => {
  const res = await api.get("/scholarships", { params: { page, size } });
  return res.data;
};

export const getScholarshipByUtxo = async (utxoRef: string): Promise<ScholarshipInfo> => {
  const res = await api.get(`/scholarships/${utxoRef}`);
  return res.data;
};

export const getStats = async (): Promise<Stats> => {
  const res = await api.get("/stats");
  return res.data;
};

export const getTransactions = async (txHash?: string) => {
  const params = txHash ? { tx_hash: txHash } : {};
  const res = await api.get("/transactions", { params });
  return res.data;
};

// --- STUDENT ENDPOINTS ---
export const getMyScholarship = async (walletAddress: string): Promise<ScholarshipInfo[]> => {
  const res = await api.get("/me/scholarship", {
    headers: { "X-Wallet-Address": walletAddress },
  });
  return res.data;
};

// --- BROWSER WALLET TX BUILDERS ---
export const buildClaimTx = async (utxoRef: string, payload: BuildClaimTxPayload): Promise<UnsignedTxResponse> => {
  const res = await api.post(`/scholarships/${utxoRef}/build-claim-tx`, payload);
  return res.data;
};

export const buildFundTx = async (payload: BuildFundTxPayload): Promise<UnsignedTxResponse> => {
  const res = await api.post("/scholarships/build-fund-tx", payload);
  return res.data;
};

export const buildApproveTx = async (utxoRef: string, payload: BuildApproveTxPayload): Promise<UnsignedTxResponse> => {
  const res = await api.post(`/scholarships/${utxoRef}/build-approve-tx`, payload);
  return res.data;
};

export const buildRevokeTx = async (utxoRef: string, payload: BuildRevokeTxPayload): Promise<UnsignedTxResponse> => {
  const res = await api.post(`/scholarships/${utxoRef}/build-revoke-tx`, payload);
  return res.data;
};

// --- SUBMIT SIGNED TX ---
export const submitSignedTx = async (signedTxCbor: string): Promise<TxResponse> => {
  const res = await api.post("/transactions/submit", { signed_tx_cbor: signedTxCbor });
  return res.data;
};

// --- ADMIN OPS (server signs with its own key) ---
export const adminApprove = async (utxoRef: string): Promise<TxResponse> => {
  const res = await api.post(`/scholarships/${utxoRef}/approve`);
  return res.data;
};

export const adminRevoke = async (utxoRef: string, reason: string): Promise<TxResponse> => {
  const res = await api.post(`/scholarships/${utxoRef}/revoke`, { reason });
  return res.data;
};

// --- ALIASES used by existing hooks (use-dashboard-queries, use-student-dashboard) ---
export const fetchStats = getStats;
export const fetchTransactions = getTransactions;

export const fetchScholarships = async ({
  page = 1,
  size = 10,
  student_id,
}: {
  page?: number;
  size?: number;
  student_id?: string;
}): Promise<PaginatedScholarships> => {
  if (student_id) {
    const res = await api.get(`/scholarships/student/${student_id}`);
    // Wrap array into paginated shape
    const data: ScholarshipInfo[] = res.data;
    return { data, total: data.length, page: 1, size: data.length };
  }
  return getScholarships(page, size);
};

export const fetchStudentDashboard = async (walletAddress: string) => {
  const scholarships = await getMyScholarship(walletAddress);
  return { scholarships, profile: null };
};

export default api;
