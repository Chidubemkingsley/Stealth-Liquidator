// src/lib/noir.ts
import { Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import circuit from "../../circuits/target/stealth_liquidator.json"; // Double check this path

export async function generateAuctionProof(bid: string, secret: string, commitment: string) {
  // 1. Initialize Backend & Noir
  const backend = new BarretenbergBackend(circuit as any);
  const noir = new Noir(circuit as any, backend);

  // 2. Prepare Inputs
  const input = { bid, secret, commitment };
  
  // 3. Generate Proof
  console.log("Generating proof with inputs:", input);
  const { proof, publicInputs } = await noir.generateProof(input);

  // 4. CONVERT FOR STARKNET: 
  // Noir returns a Uint8Array, but Starknet.js v8 needs Hex strings for contract calls
  const starknetProof = Array.from(proof).map(byte => "0x" + byte.toString(16).padStart(2, '0'));

  return { 
    proof: starknetProof, 
    publicInputs 
  };
}
