import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 8): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-6)}`;
}

export function lovelaceToAda(
  lovelace: number,
  options?: { prefix?: boolean; decimals?: number }
): string {
  const decimals = options?.decimals ?? 2;
  const amount = (lovelace / 1_000_000).toFixed(decimals);
  return options?.prefix ? `₳ ${amount}` : amount;
}

export function adaToLovelace(ada: number): number {
  return Math.floor(ada * 1_000_000);
}

/**
 * Returns the CardanoScan URL for a given tx hash.
 * Respects NEXT_PUBLIC_NETWORK env var (preprod/mainnet).
 */
export function getCardanoScanTxUrl(txHash: string): string {
  const network = process.env.NEXT_PUBLIC_NETWORK ?? "preprod";
  if (network === "mainnet") {
    return `https://cardanoscan.io/transaction/${txHash}`;
  }
  return `https://${network}.cardanoscan.io/transaction/${txHash}`;
}

export function formatRelativeTime(timestamp: number | string): string {
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
