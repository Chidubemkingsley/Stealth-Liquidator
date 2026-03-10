"use client";
import { RpcProvider } from "starknet";

const NODE_URL = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/kfBkiwD47kFq0eyGIGpbN";

export const provider = new RpcProvider({ 
  nodeUrl: NODE_URL 
});

export const CONTRACT_ADDRESSES = {
  auction:  "0x037903c842e00fe5625c688660b289bc98662b776127a21c3d1b34ddc64eb63b",
  verifier: "0x003ac3656cb749a10b27830bed9f70f954ae8a890d1dcc67038c6c041f23f738",
};

export function truncateAddress(address: string): string {
  if (!address) return "";
  const addr = address.startsWith("0x") ? address : `0x${address}`;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}