import type React from "react";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import MobileMenu from "@/components/mobile-menu";
import { ClusterProvider } from "@/components/cluster/cluster-data-access";
import {
  SolanaProvider,
  WalletButton,
} from "@/components/solana/solana-provider";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "SPL Creator",
  description:
    "Launch Tokens on Solana. Effortless and no coding required.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/icon.png",
        sizes: "192x192",
      },
    ],
    apple: "/apple-icon.png",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#111827] to-transparent">
        <ClusterProvider>
          <SolanaProvider>
            <div className="flex justify-center mt-4">
              <header className="sticky top-0 z-50 w-full lg:w-[80%] lg:mx-auto rounded-full">
                <div className="container flex h-16 items-center px-4">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="rounded-full p-2">
                      <img src="/logo.png" alt="logo" className="h-9 w-9" />
                    </div>
                  </Link>
                  <div className="ml-auto md:flex items-center">
                    <WalletButton className=" bg-purple-600 hover:bg-purple-700 " />
                  </div>
                </div>
              </header>
            </div>
            {children}
            {/* Footer */}
            <footer className="px-5 py-10">
              {/* <div className="flex flex-col gap-y-8 md:gap-10 lg:gap-x-3 xl:gap-0 md:flex-row flex-wrap justify-between w-full lg:w-[80%] mx-auto">
                <div className="mb-8 md:mb-0">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="rounded-full p-2">
                      <img src="/logo.png" alt="Logo" className="w-20 h-20" />
                    </div>
                  </Link>
                  <p className="text-gray-400 max-w-xs">
                    Launch Tokens. Effortless and no coding
                    required.
                  </p>
                </div>
              </div> */}
              <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                ©2025 All Rights Reserved.
              </div>
            </footer>
            <Toaster position="top-right" reverseOrder={false} />
          </SolanaProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}

import "./globals.css";

