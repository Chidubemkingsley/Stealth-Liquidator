"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Wallet, LogOut, Zap } from "lucide-react";
import { AccountInterface } from "starknet";
import { connectWallet, reconnectWallet, disconnectWallet } from "@/lib/wallet";
import { truncateAddress } from "@/lib/starknet";

interface ConnectWalletProps {
  onConnect?: (account: AccountInterface, address: string) => void;
  onDisconnect?: () => void;
}

export default function ConnectWallet({ onConnect, onDisconnect }: ConnectWalletProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reconnectAttempted = useRef(false);

  useEffect(() => {
    if (reconnectAttempted.current) return;
    reconnectAttempted.current = true;

    async function reconnect() {
      try {
        const result = await reconnectWallet();
        if (result) {
          setAddress(result.address);
          onConnect?.(result.account, result.address);
        }
      } catch {
        // silent fail — user will click connect manually
      }
    }

    reconnect();
  }, []); // empty deps — runs once only

  async function handleConnect() {
    setLoading(true);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        onConnect?.(result.account, result.address);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();
      setAddress(null);
      onDisconnect?.();
      reconnectAttempted.current = false;
    } catch (err) {
      console.error("Wallet disconnect failed:", err);
    }
  }

  if (address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-mono text-sm text-primary">
            {truncateAddress(address)}
          </span>
        </div>
        <button
          aria-label="Disconnect wallet"
          onClick={handleDisconnect}
          className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={handleConnect}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:glow-primary disabled:opacity-50"
    >
      {loading ? <Zap className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {loading ? "Connecting..." : "Connect Wallet"}
    </motion.button>
  );
}