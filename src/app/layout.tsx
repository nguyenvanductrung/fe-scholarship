import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletProvider } from "@/providers/wallet-provider";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { NetworkGuard } from "@/components/wallet/network-guard";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "ScholarChain – Cardano Scholarship DApp",
  description: "Decentralized, transparent scholarship management on the Cardano blockchain (Preprod)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 font-sans text-gray-100 antialiased">
        <WalletProvider>
          {/* Network warning sits at the very top */}
          <NetworkGuard className="rounded-none border-x-0 border-t-0" />

          {/* Navbar */}
          <header className="sticky top-0 z-40 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">ScholarChain</span>
                  <span className="ml-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-400">
                    Preprod
                  </span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
                <Link href="/" className="transition-colors hover:text-white">Dashboard</Link>
                <Link href="/student" className="transition-colors hover:text-white">My Scholarship</Link>
                <Link href="/admin" className="transition-colors hover:text-white">Admin</Link>
              </nav>

              {/* Wallet button */}
              <WalletConnectButton />
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

          {/* Footer */}
          <footer className="mt-16 border-t border-white/5 py-6 text-center text-xs text-gray-600">
            Built on Cardano Preprod · Powered by PyCardano &amp; MeshSDK
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
