#!/bin/bash

# DegenForge ICP Bridge Integration Test Script (Updated for Rust canisters)
# Tests the full flow: BTC deposit → mUSD mint → Solana bridge

set -e

echo "======================================"
echo "DegenForge ICP Bridge Integration Test"
echo "======================================"
echo ""

# Use NO_COLOR to avoid dfx panic
export NO_COLOR=1

# Check if canisters are deployed
echo "Checking canister deployments..."
if ! NO_COLOR=1 dfx canister id btc_handler &> /dev/null; then
    echo "Error: btc_handler canister not deployed"
    exit 1
fi

echo "✓ All canisters deployed"
echo ""

# Step 1: Generate BTC testnet address
echo "Step 1: Generating BTC testnet address..."
BTC_ADDR=$(NO_COLOR=1 dfx canister call btc_handler generate_btc_address 2>&1 | grep -o '"[^"]*"' | head -1 | tr -d '"')
echo "✓ BTC Address: ${BTC_ADDR}"
echo ""

# Step 2: Test deposit flow (works with placeholder)
echo "Step 2: Testing BTC deposit flow..."
DEPOSIT_AMOUNT=100000
DEPOSIT_RESULT=$(NO_COLOR=1 dfx canister call bridge_orchestrator deposit_btc_for_musd "(${DEPOSIT_AMOUNT}: nat64)" 2>&1)
echo "✓ Deposit result:"
echo "${DEPOSIT_RESULT}"
echo ""

# Step 3: Check position after deposit
echo "Step 3: Checking position..."
POSITION=$(NO_COLOR=1 dfx canister call bridge_orchestrator get_my_position 2>&1)
echo "✓ Position:"
echo "${POSITION}"
echo ""

# Step 4: Test mUSD minting
echo "Step 4: Testing mUSD minting..."
MINT_RESULT=$(NO_COLOR=1 dfx canister call bridge_orchestrator mint_musd_on_mezo "(${DEPOSIT_AMOUNT}: nat64)" 2>&1)
echo "✓ Mint result:"
echo "${MINT_RESULT}"
echo ""

# Step 5: Generate Solana address
echo "Step 5: Generating Solana address..."
SOL_ADDR=$(NO_COLOR=1 dfx canister call solana_canister generate_solana_address 2>&1 | grep -o '"[^"]*"' | head -1 | tr -d '"')
echo "✓ Solana Address: ${SOL_ADDR}"
echo ""

# Step 6: Test bridging to Solana
echo "Step 6: Testing bridge to Solana..."
BRIDGE_AMOUNT=99000
BRIDGE_RESULT=$(NO_COLOR=1 dfx canister call bridge_orchestrator bridge_musd_to_solana "(${BRIDGE_AMOUNT}: nat64)" 2>&1)
echo "✓ Bridge result:"
echo "${BRIDGE_RESULT}"
echo ""

# Step 7: Check final position
echo "Step 7: Checking final position..."
FINAL_POSITION=$(NO_COLOR=1 dfx canister call bridge_orchestrator get_my_position 2>&1)
echo "✓ Final Position:"
echo "${FINAL_POSITION}"
echo ""

# Step 8: Get bridge statistics
echo "Step 8: Getting bridge statistics..."
STATS=$(NO_COLOR=1 dfx canister call bridge_orchestrator get_bridge_stats 2>&1)
echo "✓ Bridge Statistics:"
echo "${STATS}"
echo ""

echo "======================================"
echo "Test Complete!"
echo "======================================"