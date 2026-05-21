"use client";

import { MeshProvider } from "@meshsdk/react";
import "@meshsdk/react/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

import { WalletBridge } from "@/components/wallet/wallet-bridge";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MeshProvider>
        <WalletBridge />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
        />
      </MeshProvider>
    </QueryClientProvider>
  );
}
