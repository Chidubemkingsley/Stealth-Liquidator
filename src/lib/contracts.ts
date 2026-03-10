import { Contract, AccountInterface } from "starknet";
import { provider, CONTRACT_ADDRESSES } from "./starknet";
import AuctionABI from "./abi/auction.abi.json";
import VerifierABI from "./abi/verifier.abi.json";

export function getAuctionContract(account?: AccountInterface) {
  const contract = new Contract({
    abi: AuctionABI,
    address: CONTRACT_ADDRESSES.auction,
    providerOrAccount: account ?? provider,
  });
  return contract;
}

export function getVerifierContract(account?: AccountInterface) {
  return new Contract({
    abi: VerifierABI,
    address: CONTRACT_ADDRESSES.verifier,
    providerOrAccount: account ?? provider,
  });
}