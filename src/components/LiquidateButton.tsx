"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, CheckCircle, AlertTriangle } from "lucide-react";
import { AccountInterface } from "starknet";
import { getAuctionContract } from "@/lib/contracts";

interface LiquidateButtonProps {
  account: AccountInterface;
}

export default function LiquidateButton({ account }: LiquidateButtonProps) {
  const [liquidating, setLiquidating] = useState(false);
  const [liquidated, setLiquidated] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleLiquidate() {
    if (!account) return;
    setLiquidating(true);
    setError("");
    try {
      const contract = getAuctionContract(account);
      const tx = await contract.advance_phase();
      console.log("Liquidation tx:", tx.transaction_hash);
      setLiquidated(true);
    } catch (err) {
      console.error("Liquidation failed:", err);
      setError(err instanceof Error ? err.message : "Liquidation failed.");
    } finally {
      setLiquidating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-destructive/30 bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
          <Flame className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Trigger Liquidation</h3>
          <p className="text-sm text-muted-foreground">Phase 3 — Execute vault liquidation on-chain</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <motion.button
        onClick={handleLiquidate}
        disabled={liquidating || liquidated}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-3 font-semibold text-destructive-foreground transition-all hover:opacity-90 disabled:opacity-40"
      >
        {liquidated ? (
          <><CheckCircle className="h-4 w-4" /> Liquidation Triggered</>
        ) : liquidating ? (
          "Executing..."
        ) : (
          <><Flame className="h-4 w-4" /> Start Liquidation</>
        )}
      </motion.button>
    </motion.div>
  );
}