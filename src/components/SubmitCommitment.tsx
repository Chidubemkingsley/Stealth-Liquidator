"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Send, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { AccountInterface } from "starknet";
import { submitCommitment } from "@/lib/commitment";

interface SubmitCommitmentProps {
  account: AccountInterface;
}

export default function SubmitCommitment({ account }: SubmitCommitmentProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [commitment, setCommitment] = useState<string>("");
  const [error, setError] = useState<string>("");

  function isValidBid(value: string): boolean {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  function handleReset() {
    setSubmitted(false);
    setBidAmount("");
    setTxHash("");
    setCommitment("");
    setError("");
  }

  async function handleSubmit() {
    if (!account || !bidAmount.trim()) return;
    if (!isValidBid(bidAmount)) {
      setError("Enter a valid bid amount greater than 0.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await submitCommitment(account, BigInt(bidAmount));

      setTxHash(result.txHash);
      setCommitment(result.commitment.toString(16));
      setSubmitted(true);
    } catch (err) {
      console.error("Commitment submission failed:", err);
      setError("Submission failed. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = !bidAmount.trim() || !isValidBid(bidAmount) || submitting || submitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Submit Commitment
            </h3>
            <p className="text-sm text-muted-foreground">
              Phase 1 — Commit your sealed bid
            </p>
          </div>
        </div>
        
        {/* Reset button when submitted */}
        {submitted && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            New Bid
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        {/* Bid input */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Bid Amount
          </label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              setError("");
            }}
            placeholder="Enter bid amount..."
            disabled={submitted}
            min="1"
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2"
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Success info */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2"
          >
            <p className="text-xs font-medium text-primary">
              ✓ Commitment submitted successfully
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Commitment hash:</p>
              <p className="break-all rounded bg-background/50 p-2 font-mono text-xs text-foreground">
                0x{commitment}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Transaction hash:</p>
              <a
                href={`https://sepolia.starkscan.co/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-xs text-primary hover:underline"
              >
                {txHash}
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              🔐 Your secret has been saved locally for the reveal phase.
            </p>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-all ${
            submitted
              ? "bg-primary/20 text-primary cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:glow-primary"
          } disabled:opacity-40`}
        >
          {submitted ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Committed
            </>
          ) : submitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Generating proof & submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Commitment
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}