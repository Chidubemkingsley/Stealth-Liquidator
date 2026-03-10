#[starknet::contract]
mod Verifier {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use starknet::storage::{
        StoragePointerWriteAccess,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        Map,
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        verified_proofs: Map::<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ProofVerified: ProofVerified,
        ProofRejected: ProofRejected,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofVerified {
        commitment: felt252,
        caller: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofRejected {
        commitment: felt252,
        caller: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    // ── Proof Verification ────────────────────────────────────────────────────
    // In production: replace body with actual Groth16 / UltraPlonk verifier logic
    // generated from: bb write_vk + bb write_cairo_verifier

    #[external(v0)]
    fn verify_proof(
        ref self: ContractState,
        proof: Array<felt252>,
        public_inputs: Array<felt252>,
    ) -> bool {
        let caller = get_caller_address();

        // public_inputs[0] is the commitment being verified
        assert(public_inputs.len() > 0, 'No public inputs');

        let commitment = *public_inputs.at(0);

        // Placeholder: always returns true for PoC
        // Replace with real Groth16 verifier call in production
        let verified = true;

        if verified {
            self.verified_proofs.write(commitment, true);
            self.emit(ProofVerified { commitment, caller });
        } else {
            self.emit(ProofRejected { commitment, caller });
        }

        verified
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    #[external(v0)]
    fn is_verified(self: @ContractState, commitment: felt252) -> bool {
        self.verified_proofs.read(commitment)
    }
}