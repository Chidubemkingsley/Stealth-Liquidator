import { poseidonHashMany } from "micro-starknet";
import { AccountInterface } from "starknet";
import { getAuctionContract } from "@/lib/contracts";

export function generateCommitment(bid: bigint, secret: bigint): bigint {
  return poseidonHashMany([bid, secret]);
}

export function generateSecret(): bigint {
  const array = new Uint8Array(31);
  crypto.getRandomValues(array);
  return BigInt("0x" + Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join(""));
}

export async function submitCommitment(
  account: AccountInterface,
  bidAmount: bigint,
  manualSecret?: bigint
): Promise<{ commitment: bigint; secret: bigint; txHash: string }> {
  const secret = manualSecret ?? generateSecret();
  const commitment = generateCommitment(bidAmount, secret);

  const contract = getAuctionContract(account);
  const tx = await contract.submit_commitment(commitment);

  localStorage.setItem(`bid_secret_${commitment.toString()}`, secret.toString());
  localStorage.setItem(`bid_value_${commitment.toString()}`, bidAmount.toString());

  return { commitment, secret, txHash: tx.transaction_hash };
}

export async function revealBid(
  account: AccountInterface,
  bidAmount: bigint,
  commitment: bigint
): Promise<string> {
  const storedSecret = localStorage.getItem(`bid_secret_${commitment.toString()}`);
  if (!storedSecret) throw new Error("Secret not found — cannot reveal bid");

  const secret = BigInt(storedSecret);
  const recomputed = generateCommitment(bidAmount, secret);
  if (recomputed !== commitment) throw new Error("Local commitment verification failed");

  const contract = getAuctionContract(account);
  const tx = await contract.reveal_bid(bidAmount, secret);

  return tx.transaction_hash;
}