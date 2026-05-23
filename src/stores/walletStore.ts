"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BrowserWallet, type UTxO } from "@meshsdk/core";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";
const EXPECTED_NETWORK = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? 1 : 0; // 0 = testnet, 1 = mainnet

interface WalletState {
  walletAddress: string | null;
  walletName: string | null;
  balance: string | null; // in ADA
  isAdmin: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  networkWarning: boolean;
  error: string | null;

  // Actions
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  getUtxos: () => Promise<UTxO[]>;
  signTx: (txCbor: string, partialSign?: boolean) => Promise<string>;
  submitTx: (txCbor: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

// Internal wallet reference (not stored in zustand)
let _wallet: BrowserWallet | null = null;

export const useWalletStore = create<WalletState>()(
  persist<
    WalletState,
    [],
    [],
    Pick<WalletState, "walletName" | "walletAddress">
  >(
    (set) => ({
      walletAddress: null,
      walletName: null,
      balance: null,
      isAdmin: false,
      isConnected: false,
      isConnecting: false,
      networkWarning: false,
      error: null,

      connect: async (walletName: string) => {
        set({ isConnecting: true, error: null });
        try {
          const wallet = await BrowserWallet.enable(walletName);
          _wallet = wallet;

          // Network check
          const networkId = await wallet.getNetworkId();
          const isWrongNetwork = networkId !== EXPECTED_NETWORK;

          const usedAddresses = await wallet.getUsedAddresses();
          const address = usedAddresses[0] ?? (await wallet.getChangeAddress());

          // Get balance
          const lovelace = await wallet.getLovelace();
          const adaBalance = (parseInt(lovelace) / 1_000_000).toFixed(2);

          set({
            walletAddress: address,
            walletName,
            balance: adaBalance,
            isAdmin: ADMIN_ADDRESS ? address === ADMIN_ADDRESS : false,
            isConnected: true,
            isConnecting: false,
            networkWarning: isWrongNetwork,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to connect wallet";
          set({ isConnecting: false, error: msg, isConnected: false });
        }
      },

      disconnect: () => {
        _wallet = null;
        set({
          walletAddress: null,
          walletName: null,
          balance: null,
          isAdmin: false,
          isConnected: false,
          networkWarning: false,
          error: null,
        });
      },

      getUtxos: async () => {
        if (!_wallet) throw new Error("Wallet not connected");
        return await _wallet.getUtxos();
      },

      signTx: async (txCbor: string, partialSign = true) => {
        if (!_wallet) throw new Error("Wallet not connected");
        return await _wallet.signTx(txCbor, partialSign);
      },

      submitTx: async (txCbor: string) => {
        if (!_wallet) throw new Error("Wallet not connected");
        return await _wallet.submitTx(txCbor);
      },

      refreshBalance: async () => {
        if (!_wallet) return;
        try {
          const lovelace = await _wallet.getLovelace();
          const adaBalance = (parseInt(lovelace) / 1_000_000).toFixed(2);
          set({ balance: adaBalance });
        } catch {
          // silently fail
        }
      },
    }),
    {
      name: "cardano-wallet-store",
      partialize: (state) => ({
        walletName: state.walletName,
        walletAddress: state.walletAddress,
      }),
    }
  )
);
