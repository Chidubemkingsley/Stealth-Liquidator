"use client";

import { connect, disconnect } from "starknetkit";
import { AccountInterface } from "starknet";

type WalletConnection = {
  account: AccountInterface;
  address: string;
};

/**
 * Opens wallet modal for manual connection
 */
export async function connectWallet(): Promise<WalletConnection | null> {
  try {
    const { wallet } = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
    });

    if (!wallet?.account || !wallet?.selectedAddress) {
      return null;
    }

    return {
      account: wallet.account as AccountInterface,
      address: wallet.selectedAddress,
    };
  } catch (error) {
    console.error("Wallet connection failed:", error);
    return null;
  }
}

/**
 * Silent reconnect without opening wallet modal
 */
export async function reconnectWallet(): Promise<WalletConnection | null> {
  try {
    const { wallet } = await connect({
      modalMode: "neverAsk",
    });

    if (!wallet?.account || !wallet?.selectedAddress) {
      return null;
    }

    return {
      account: wallet.account as AccountInterface,
      address: wallet.selectedAddress,
    };
  } catch (error) {
    console.error("Wallet reconnect failed:", error);
    return null;
  }
}

/**
 * Disconnect wallet and clear cached wallet
 */
export async function disconnectWallet(): Promise<void> {
  try {
    await disconnect({
      clearLastWallet: true,
    });
  } catch (error) {
    console.error("Wallet disconnect failed:", error);
  }
}

/**
 * Shortens wallet address for UI display
 */
export function truncateAddress(address: string): string {
  if (!address) return "";

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return `${start}...${end}`;
}