"use client";

import {
  useLovelace,
  useNetwork,
  useWallet,
} from "@meshsdk/react";
import { useEffect } from "react";

import { useWalletStore } from "@/stores/use-wallet-store";

/**
 * Syncs Mesh wallet context into the Zustand store and registers delegate actions.
 */
export function WalletBridge() {
  const { connect, disconnect, connected, connecting, name, wallet, address } =
    useWallet();
  const lovelace = useLovelace();
  const networkId = useNetwork();

  const setMeshDelegates = useWalletStore((s) => s.setMeshDelegates);
  const syncWallet = useWalletStore((s) => s.syncWallet);

  useEffect(() => {
    setMeshDelegates({
      connect,
      disconnect,
      getWallet: () => (connected && wallet ? wallet : null),
    });
  }, [connect, disconnect, connected, wallet, setMeshDelegates]);

  useEffect(() => {
    syncWallet({
      walletAddress: connected && address ? address : null,
      walletName: connected && name ? name : null,
      adaBalance: lovelace ?? null,
      networkId,
      isConnected: connected,
      isConnecting: connecting,
    });
  }, [
    address,
    connected,
    connecting,
    lovelace,
    name,
    networkId,
    syncWallet,
  ]);

  return null;
}
