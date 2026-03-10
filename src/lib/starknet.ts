"use client";
import { RpcProvider } from "starknet";

const NODE_URL = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/kfBkiwD47kFq0eyGIGpbN";

export const provider = new RpcProvider({ 
  nodeUrl: NODE_URL 
});

export const CONTRACT_ADDRESSES = {
  auction:  "0x02191d671922e28e1e12bba1d059bdd827d835d510cd015469080e5280041dc1",
  verifier: "0x056dfd41b229ce20bf70e379928257d5559a016c1c37d2f39c1fad10820effbd",
};

export function truncateAddress(address: string): string {
  if (!address) return "";
  const addr = address.startsWith("0x") ? address : `0x${address}`;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}