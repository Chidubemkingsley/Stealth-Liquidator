#[starknet::contract]
mod Auction {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use core::poseidon::poseidon_hash_span;
    use starknet::storage::{
        StoragePointerReadAccess,
        StoragePointerWriteAccess,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        Map,
    };

    #[storage]
    struct Storage {
        merkle_root: felt252,
        commitments: Map::<ContractAddress, felt252>,
        reveals: Map::<ContractAddress, felt252>,
        phase: u8,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CommitmentSubmitted: CommitmentSubmitted,
        BidRevealed: BidRevealed,
        PhaseChanged: PhaseChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct CommitmentSubmitted {
        bidder: ContractAddress,
        commitment: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct BidRevealed {
        bidder: ContractAddress,
        bid: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct PhaseChanged {
        new_phase: u8,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.phase.write(0); // 0 = commit phase
    }

    // ── Commit Phase ──────────────────────────────────────────────────────────

    #[external(v0)]
    fn submit_commitment(ref self: ContractState, commitment: felt252) {
        assert(self.phase.read() == 0, 'Not in commit phase');

        let caller = get_caller_address();

        assert(self.commitments.read(caller) == 0, 'Already committed');

        self.commitments.write(caller, commitment);

        self.emit(CommitmentSubmitted { bidder: caller, commitment });
    }

    // ── Reveal Phase ──────────────────────────────────────────────────────────

    #[external(v0)]
    fn reveal_bid(ref self: ContractState, bid: felt252, secret: felt252) {
        assert(self.phase.read() == 1, 'Not in reveal phase');

        let caller = get_caller_address();

        let stored_commitment = self.commitments.read(caller);

        assert(stored_commitment != 0, 'No commitment found');

        // Recompute Poseidon(bid, secret) — must match frontend commitment.ts
        let computed_commitment = poseidon_hash_span(array![bid, secret].span());

        assert(stored_commitment == computed_commitment, 'Invalid reveal');

        self.reveals.write(caller, bid);

        self.emit(BidRevealed { bidder: caller, bid });
    }

    // ── Phase Management (owner only) ─────────────────────────────────────────

    #[external(v0)]
    fn advance_phase(ref self: ContractState) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner');

        let current = self.phase.read();
        assert(current < 2, 'Already finalized');

        self.phase.write(current + 1);

        self.emit(PhaseChanged { new_phase: current + 1 });
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    #[external(v0)]
    fn get_phase(self: @ContractState) -> u8 {
        self.phase.read()
    }

    #[external(v0)]
    fn get_commitment(self: @ContractState, bidder: ContractAddress) -> felt252 {
        self.commitments.read(bidder)
    }

    #[external(v0)]
    fn get_reveal(self: @ContractState, bidder: ContractAddress) -> felt252 {
        self.reveals.read(bidder)
    }

    #[external(v0)]
    fn update_merkle_root(ref self: ContractState, root: felt252) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner');
        self.merkle_root.write(root);
    }
}