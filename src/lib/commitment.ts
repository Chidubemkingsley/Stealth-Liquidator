import { poseidonHashMany } from "micro-starknet";
import { AccountInterface } from "starknet";
import { getAuctionContract } from "@/lib/contracts";

/**
 * SHARED CONFIGURATION
 * These must match your prover.toml exactly for the hashes to align.
 */
const SHARED_SECRET = BigInt("12345");

/**
 * Generates the Poseidon hash of the bid and the secret.
 * Note: micro-starknet's poseidonHashMany expects an array of bigints.
 */
export function generateCommitment(bid: bigint, secret: bigint): bigint {
  return poseidonHashMany([bid, secret]);
}

/**
 * PHASE 1: Submit Commitment
 * Uses the hardcoded secret so anyone cloning the repo generates the same hash.
 */
export async function submitCommitment(
  account: AccountInterface,
  bidAmount: bigint
): Promise<{ commitment: bigint; txHash: string }> {
  const contract = getAuctionContract(account);
  
  // Use the secret from prover.toml
  const secret = SHARED_SECRET;
  const commitment = generateCommitment(bidAmount, secret);

  console.log("Submitting Commitment:", "0x" + commitment.toString(16));
  
  const tx = await contract.submit_commitment(commitment);
  return { commitment, txHash: tx.transaction_hash };
}

/**
 * PHASE 2: Reveal Bid
 * Re-calculates the hash using the hardcoded secret to verify before sending on-chain.
 */
export async function revealBid(
  account: AccountInterface,
  bidAmount: bigint,
  commitment: bigint
): Promise<string> {
  const contract = getAuctionContract(account);
  
  // Use the same hardcoded secret
  const secret = SHARED_SECRET;
  
  // Safety check: Does (Your Input Bid + 12345) == The Hash on the Blockchain?
  const recomputed = generateCommitment(bidAmount, secret);
  
  if (recomputed !== commitment) {
    const expected = "0x" + commitment.toString(16);
    const actual = "0x" + recomputed.toString(16);
    throw new Error(`Hash Mismatch! \nExpected: ${expected}\nGenerated: ${actual}\nDid you enter the correct bid amount?`);
  }

  const tx = await contract.reveal_bid(bidAmount, secret);
  return tx.transaction_hash;
}
