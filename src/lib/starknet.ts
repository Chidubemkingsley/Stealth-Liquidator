"use client";
import { RpcProvider } from "starknet";

const NODE_URL = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/kfBkiwD47kFq0eyGIGpbN";

export const provider = new RpcProvider({ 
  nodeUrl: NODE_URL 
});

export const CONTRACT_ADDRESSES = {
  auction:  "0x02394daf049cd872280410c20875432558617d6e087dff9aca9191c9b949a687",
  verifier: "0x01b2a6a165fd08ee3f2c33605bc2d8bf93c721f8ebad2a31fa9876b92dbcbbb9",
};

export function truncateAddress(address: string): string {
  if (!address) return "";
  const addr = address.startsWith("0x") ? address : `0x${address}`;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}