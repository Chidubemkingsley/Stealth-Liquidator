"use client";

import { useEffect, useState } from "react";
import { AccountInterface } from "starknet";
import { provider, CONTRACT_ADDRESSES } from "@/lib/starknet";
import AuctionABI from "@/lib/abi/auction.abi.json";
import { Contract } from "starknet";

export function useAuctionState(account: AccountInterface | null) {
  const [phase, setPhase] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Always use Alchemy provider for reads — not wallet provider
    const contract = new Contract({
      abi: AuctionABI,
      address: CONTRACT_ADDRESSES.auction,
      providerOrAccount: provider,
    });

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await contract.get_phase();
        const phase = typeof result === "object"
          ? Number(Object.values(result)[0])
          : Number(result);
        setPhase(phase);
      } catch (err) {
        console.error("Failed to fetch auction phase:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch phase.");
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [account]);

  return { phase, loading, error };
}