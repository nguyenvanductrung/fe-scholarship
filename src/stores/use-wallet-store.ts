import type { MeshCardanoBrowserWallet } from "@meshsdk/react";
import { create } from "zustand";

const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";
const expectedNetworkId = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? 1 : 0;

function lovelaceToAdaBalance(lovelace: string | null): string | null {
  if (!lovelace) {
    return null;
  }

  const amount = Number(lovelace);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return (amount / 1_000_000).toFixed(2);
}

interface MeshDelegates {
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  getWallet: () => MeshCardanoBrowserWallet | null;
}

interface WalletState {
  walletAddress: string | null;
  walletName: string | null;
  isAdmin: boolean;
  adaBalance: string | null;
  balance: string | null;
  networkId: number | undefined;
  networkWarning: boolean;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;

  setMeshDelegates: (delegates: MeshDelegates) => void;
  syncWallet: (data: {
    walletAddress: string | null;
    walletName: string | null;
    adaBalance: string | null;
    networkId: number | undefined;
    isConnected: boolean;
    isConnecting: boolean;
  }) => void;

  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  getUtxos: () => Promise<string[]>;
  signTx: (txCbor: string, partialSign?: boolean) => Promise<string>;
  submitTx: (txCbor: string) => Promise<string>;
}

let meshDelegates: MeshDelegates | null = null;

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  walletName: null,
  isAdmin: false,
  adaBalance: null,
  balance: null,
  networkId: undefined,
  networkWarning: false,
  error: null,
  isConnected: false,
  isConnecting: false,

  setMeshDelegates: (delegates) => {
    meshDelegates = delegates;
  },

  syncWallet: (data) => {
    const isAdmin =
      !!adminAddress &&
      !!data.walletAddress &&
      data.walletAddress === adminAddress;
    const networkWarning =
      data.isConnected &&
      typeof data.networkId === "number" &&
      data.networkId !== expectedNetworkId;

    set({
      ...data,
      balance: lovelaceToAdaBalance(data.adaBalance),
      isAdmin,
      networkWarning,
      error: null,
    });
  },

  connect: async (walletName) => {
    if (!meshDelegates) {
      throw new Error("Wallet provider not initialized");
    }
    set({ isConnecting: true, error: null });
    try {
      await meshDelegates.connect(walletName);
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Khong the ket noi vi";
      set({ error });
      throw err;
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    meshDelegates?.disconnect();
    set({
      walletAddress: null,
      walletName: null,
      isAdmin: false,
      adaBalance: null,
      balance: null,
      networkId: undefined,
      networkWarning: false,
      error: null,
      isConnected: false,
      isConnecting: false,
    });
  },

  getUtxos: async () => {
    const wallet = meshDelegates?.getWallet();
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    return wallet.getUtxos();
  },

  signTx: async (txCbor, partialSign = false) => {
    const wallet = meshDelegates?.getWallet();
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    return wallet.signTxReturnFullTx(txCbor, partialSign);
  },

  submitTx: async (txCbor) => {
    const wallet = meshDelegates?.getWallet();
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    return wallet.submitTx(txCbor);
  },
}));
