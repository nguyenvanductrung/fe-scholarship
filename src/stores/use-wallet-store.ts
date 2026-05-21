import type { MeshCardanoBrowserWallet } from "@meshsdk/react";
import { create } from "zustand";

const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";

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
  networkId: number | undefined;
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
  networkId: undefined,
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

    set({
      ...data,
      isAdmin,
    });
  },

  connect: async (walletName) => {
    if (!meshDelegates) {
      throw new Error("Wallet provider not initialized");
    }
    set({ isConnecting: true });
    try {
      await meshDelegates.connect(walletName);
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
      networkId: undefined,
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
