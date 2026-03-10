"use client";
import { connect, disconnect } from "starknetkit";
import { AccountInterface } from "starknet";

export async function connectWallet() {
  const { wallet } = await connect({ 
    modalMode: "alwaysAsk", 
    modalTheme: "dark" 
  });
  if (!wallet?.account || !wallet?.selectedAddress) return null;
  return { account: wallet.account as AccountInterface, address: wallet.selectedAddress };
}

export async function reconnectWallet() {
  try {
    const { wallet } = await connect({ 
      modalMode: "neverAsk",
      modalTheme: "dark"
    });
    if (!wallet?.account || !wallet?.selectedAddress) return null;
    return { account: wallet.account as AccountInterface, address: wallet.selectedAddress };
  } catch {
    return null;
  }
}

export async function disconnectWallet() {
  await disconnect({ clearLastWallet: true });
}