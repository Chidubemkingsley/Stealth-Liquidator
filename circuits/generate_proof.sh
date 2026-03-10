# ── Step 3: Run tests ──────────────────────────────────────────────────────
echo ""
echo "[3/5] Running tests..."
nargo test
echo "✓ Tests passed"
# ── Step 4: Generate witness and proof ─────────────────────────────────────
echo ""
echo "[4/5] Generating proof..."
echo ""
echo "⚠️  Make sure Prover.toml has your real bid and secret values"
echo ""

nargo execute witness

bb prove --scheme ultra_keccak_zk_honk \
  -b ./target/stealth_liquidator.json \
  -w ./target/witness.gz \
  -o ./target/proof

echo "✓ Proof generated at target/proof"

# ── Step 5: Verify proof ───────────────────────────────────────────────────
echo ""
echo "[5/5] Verifying proof..."

bb write_vk --scheme ultra_keccak_zk_honk \
  -b ./target/stealth_liquidator.json \
  -o ./target/vk

bb verify --scheme ultra_keccak_zk_honk \
  -k ./target/vk/vk \
  -p ./target/proof/proof

echo "✓ Proof verified locally"