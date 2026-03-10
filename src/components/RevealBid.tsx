"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { AccountInterface } from "starknet";
import { revealBid } from "@/lib/commitment";

interface RevealBidProps {
  account: AccountInterface;
}

export default function RevealBid({ account }: RevealBidProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [commitment, setCommitment] = useState<string>("");
  const [revealing, setRevealing] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  function isValidBid(value: string): boolean {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  function isValidCommitment(value: string): boolean {
    return /^(0x)?[a-fA-F0-9]+$/.test(value.trim());
  }

  function handleReset() {
    setRevealed(false);
    setBidAmount("");
    setCommitment("");
    setTxHash("");
    setError("");
  }

  async function handleReveal() {
    if (!account || !bidAmount.trim() || !commitment.trim()) return;
    if (!isValidBid(bidAmount)) { setError("Enter a valid bid amount greater than 0."); return; }
    if (!isValidCommitment(commitment)) { setError("Invalid commitment format."); return; }

    setRevealing(true);
    setError("");

    try {
      const commitmentBigInt = BigInt(commitment.startsWith("0x") ? commitment : `0x${commitment}`);
      const hash = await revealBid(account, BigInt(bidAmount), commitmentBigInt);
      setTxHash(hash);
      setRevealed(true);
    } catch (err) {
      console.error("Bid reveal failed:", err);
      setError(err instanceof Error ? err.message : "Reveal failed.");
    } finally {
      setRevealing(false);
    }
  }

  const disabled = !bidAmount.trim() || !commitment.trim() || !isValidBid(bidAmount) || !isValidCommitment(commitment) || revealing || revealed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Eye className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Reveal Bid</h3>
            <p className="text-sm text-muted-foreground">Phase 2 — Reveal your sealed bid on-chain</p>
          </div>
        </div>
        {revealed && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> New Reveal
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Bid Amount</label>
          <input type="number" value={bidAmount} onChange={(e) => { setBidAmount(e.target.value); setError(""); }}
            placeholder="Enter your original bid amount..." disabled={revealed} min="1"
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none disabled:opacity-50" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Commitment Hash</label>
          <input type="text" value={commitment} onChange={(e) => { setCommitment(e.target.value); setError(""); }}
            placeholder="0x... commitment from Phase 1" disabled={revealed}
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none disabled:opacity-50" />
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </motion.div>
        )}

        {revealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
            <p className="text-xs font-medium text-primary">✓ Bid revealed successfully</p>
            <a href={`https://sepolia.starkscan.co/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="break-all font-mono text-xs text-primary hover:underline">{txHash}</a>
          </motion.div>
        )}

        <motion.button onClick={handleReveal} disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.01 }} whileTap={{ scale: disabled ? 1 : 0.99 }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-all ${
            revealed ? "border border-primary/30 bg-primary/10 text-primary cursor-not-allowed"
            : "border border-accent bg-accent/10 text-accent hover:bg-accent/20"
          } disabled:opacity-40`}>
          {revealed ? <><CheckCircle className="h-4 w-4" /> Verified & Revealed</>
          : revealing ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /> Verifying...</>
          : <><ShieldCheck className="h-4 w-4" /> Reveal Bid</>}
        </motion.button>
      </div>
    </motion.div>
  );
}