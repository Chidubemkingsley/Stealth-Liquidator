"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Github } from "lucide-react";
import { AccountInterface } from "starknet";
import { useAuctionState } from "@/hooks/useAuctionState";
import ConnectWallet from "@/components/ConnectWallet";
import SubmitCommitment from "@/components/SubmitCommitment";
import RevealBid from "@/components/RevealBid";
import LiquidateButton from "@/components/LiquidateButton";
import StatusIndicator from "@/components/StatusIndicator";
import PhaseTimer from "@/components/PhaseTimer";

const PHASE_LABELS: Record<number, string> = {
  0: "Phase 1 — Commit",
  1: "Phase 2 — Reveal",
  2: "Phase 3 — Finalized",
};

const AUCTION_END = Date.now() + 1000 * 60 * 30;

const Index = () => {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [connected, setConnected] = useState(false);

  const { phase, loading, error } = useAuctionState(account);

  function handleConnect(acc: AccountInterface, _address: string) {
    setAccount(acc);
    setConnected(true);
  }

  function handleDisconnect() {
    setAccount(null);
    setConnected(false);
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Stealth Liquidator
              </h1>
              <p className="text-xs text-muted-foreground">ZK-Verified · Starknet</p>
            </div>
          </div>
          <ConnectWallet onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>
      </header>

      {/* Main */}
      <main className="container py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="mb-2 text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">Privacy-First</span>{" "}
            <span className="text-foreground">Liquidation Protocol</span>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Submit sealed bid commitments, reveal with ZK proofs, and trigger vault
            liquidations — all verified on-chain with Groth16.
          </p>
        </motion.div>

        {/* Status */}
        <div className="mb-4">
          <StatusIndicator connected={connected} />
        </div>

        {/* Auction Phase Banner */}
        {connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-foreground">
                {loading ? "Loading phase..." : PHASE_LABELS[phase] ?? "Unknown Phase"}
              </span>
              {error && (
                <span className="text-xs text-destructive">{error}</span>
              )}
            </div>
            <PhaseTimer end={AUCTION_END} />
          </motion.div>
        )}

        {/* Action Cards */}
        {connected && account ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SubmitCommitment account={account} />
            <RevealBid account={account} />
            <LiquidateButton account={account} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Connect Your Wallet
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Connect ArgentX or Braavos to interact with the Stealth Liquidator contracts
              on Starknet Sepolia.
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4 text-xs text-muted-foreground">
          <span>Stealth Liquidator v0.1.0 · Cairo + Noir + Groth16</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            Source
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;