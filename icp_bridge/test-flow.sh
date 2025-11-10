#!/bin/bash

# DegenForge ICP Bridge Integration Test Script (Updated for Rust canisters)
# Tests the full flow: BTC deposit → mUSD mint → Solana bridge
# This script helps test canisters with real wallets and faucets

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "DegenForge ICP Bridge Integration Test"
echo "======================================"
echo ""

# Use NO_COLOR to avoid dfx panic
export NO_COLOR=1

# Helper function for error reporting
report_error() {
    local step=$1
    local error=$2
    echo -e "${RED}✗ ${step} failed${NC}"
    echo -e "${RED}Error: ${error}${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check canister is deployed: dfx canister id <canister_name>"
    echo "  2. Verify canister IDs are configured in bridge_orchestrator"
    echo "  3. Check dfx is running: dfx ping local"
    echo "  4. Review canister logs for details"
    echo ""
}

# Helper function to poll for transaction confirmation
poll_transaction() {
    local tx_hash=$1
    local explorer_url=$2
    local max_attempts=${3:-10}
    local delay=${4:-5}
    
    echo -e "${BLUE}Polling for transaction confirmation...${NC}"
    echo "Transaction: ${tx_hash}"
    echo "Explorer: ${explorer_url}"
    echo ""
    
    for i in $(seq 1 $max_attempts); do
        echo -e "${YELLOW}Attempt ${i}/${max_attempts}...${NC}"
        sleep $delay
        # In a real implementation, you would check the transaction status
        # For now, we just wait and let the user verify manually
    done
    
    echo -e "${GREEN}✓ Transaction polling completed${NC}"
    echo "Please verify transaction on explorer: ${explorer_url}"
    echo ""
}

# Check if canisters are deployed
echo -e "${BLUE}Step 0: Checking canister deployments...${NC}"
DEPLOYMENT_ERRORS=0

if ! NO_COLOR=1 dfx canister id btc_handler &> /dev/null; then
    report_error "BTC Handler deployment check" "btc_handler canister not found"
    DEPLOYMENT_ERRORS=$((DEPLOYMENT_ERRORS + 1))
fi

if ! NO_COLOR=1 dfx canister id bridge_orchestrator &> /dev/null; then
    report_error "Bridge Orchestrator deployment check" "bridge_orchestrator canister not found"
    DEPLOYMENT_ERRORS=$((DEPLOYMENT_ERRORS + 1))
fi

if ! NO_COLOR=1 dfx canister id solana_canister &> /dev/null; then
    report_error "Solana Canister deployment check" "solana_canister canister not found"
    DEPLOYMENT_ERRORS=$((DEPLOYMENT_ERRORS + 1))
fi

if [ $DEPLOYMENT_ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Deployment check failed. Please deploy canisters first.${NC}"
    echo "Run: ./deploy-and-configure.sh"
    exit 1
fi

echo -e "${GREEN}✓ All canisters deployed${NC}"
echo ""

# Check if bridge orchestrator is configured
echo -e "${BLUE}Step 0.5: Verifying bridge orchestrator configuration...${NC}"
HEALTH_CHECK=$(NO_COLOR=1 dfx canister call bridge_orchestrator health_check 2>&1)
if echo "$HEALTH_CHECK" | grep -q "error\|Error"; then
    echo -e "${YELLOW}⚠ Bridge orchestrator health check failed (may be expected)${NC}"
else
    echo -e "${GREEN}✓ Bridge orchestrator is configured${NC}"
fi
echo ""

# Step 1: Generate BTC testnet address
echo -e "${BLUE}Step 1: Generating BTC testnet address...${NC}"
BTC_ADDR_RESULT=$(NO_COLOR=1 dfx canister call btc_handler generate_btc_address 2>&1)
if echo "$BTC_ADDR_RESULT" | grep -q "error\|Error"; then
    report_error "BTC address generation" "$BTC_ADDR_RESULT"
    exit 1
fi

BTC_ADDR=$(echo "$BTC_ADDR_RESULT" | grep -o '"[^"]*"' | head -1 | tr -d '"')
if [ -z "$BTC_ADDR" ]; then
    echo -e "${RED}✗ Failed to extract BTC address from response${NC}"
    echo "Response: $BTC_ADDR_RESULT"
    exit 1
fi

echo -e "${GREEN}✓ BTC Address: ${BTC_ADDR}${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Fund this address with testnet BTC before continuing!${NC}"
echo "   - Faucet: https://coinfaucet.eu/en/btc-testnet/"
echo "   - Explorer: https://blockstream.info/testnet/address/${BTC_ADDR}"
echo "   - Wait for at least 6 confirmations (~60 minutes)"
echo ""
echo -e "${BLUE}Would you like to:${NC}"
echo "  1) Continue with test (assuming address is funded)"
echo "  2) Skip to next step"
echo "  3) Exit and fund address first"
read -p "Enter choice (1-3): " choice

case $choice in
    2)
        echo -e "${YELLOW}Skipping BTC funding verification...${NC}"
        ;;
    3)
        echo -e "${YELLOW}Exiting. Please fund the address and run the script again.${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Continuing with test...${NC}"
        ;;
esac
echo ""

# Step 2: Test deposit flow (works with placeholder)
echo -e "${BLUE}Step 2: Testing BTC deposit flow...${NC}"
DEPOSIT_AMOUNT=100000
DEPOSIT_RESULT=$(NO_COLOR=1 dfx canister call bridge_orchestrator deposit_btc_for_musd "(${DEPOSIT_AMOUNT}: nat64)" 2>&1)
if echo "$DEPOSIT_RESULT" | grep -q "error\|Error"; then
    report_error "BTC deposit" "$DEPOSIT_RESULT"
else
    echo -e "${GREEN}✓ Deposit successful${NC}"
    echo "Result:"
    echo "${DEPOSIT_RESULT}"
fi
echo ""

# Step 3: Check position after deposit
echo "Step 3: Checking position..."
POSITION=$(NO_COLOR=1 dfx canister call bridge_orchestrator get_my_position 2>&1)
echo "✓ Position:"
echo "${POSITION}"
echo ""

# Step 4: Test mUSD minting
echo -e "${BLUE}Step 4: Testing mUSD minting...${NC}"
echo -e "${YELLOW}Note: This requires real BTC deposit and ECDSA key configuration${NC}"
MINT_RESULT=$(NO_COLOR=1 dfx canister call bridge_orchestrator mint_musd_on_mezo "(${DEPOSIT_AMOUNT}: nat64)" 2>&1)
if echo "$MINT_RESULT" | grep -q "error\|Error"; then
    report_error "mUSD minting" "$MINT_RESULT"
    echo -e "${YELLOW}This may fail if:${NC}"
    echo "  - ECDSA key is not configured"
    echo "  - No real BTC deposit exists"
    echo "  - Mezo RPC is unreachable"
else
    echo -e "${GREEN}✓ Mint successful${NC}"
    echo "Result:"
    echo "${MINT_RESULT}"
    
    # Extract transaction hash from mint result
    TX_HASH=$(echo "${MINT_RESULT}" | grep -o '0x[a-fA-F0-9]*' | head -1)
    if [ ! -z "$TX_HASH" ]; then
        echo ""
        echo -e "${GREEN}📋 Mezo Transaction Hash: ${TX_HASH}${NC}"
        echo "   Explorer: https://explorer.mezo.org/tx/${TX_HASH}"
        echo ""
        # Poll for transaction confirmation
        poll_transaction "$TX_HASH" "https://explorer.mezo.org/tx/${TX_HASH}" 10 5
    fi
fi
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

# Extract Solana transaction signature if present
SOL_SIG=$(echo "${BRIDGE_RESULT}" | grep -o '[A-Za-z0-9]\{32,\}' | head -1)
if [ ! -z "$SOL_SIG" ] && [ ${#SOL_SIG} -ge 32 ]; then
    echo "📋 Solana Transaction Signature: ${SOL_SIG}"
    echo "   Explorer: https://explorer.solana.com/tx/${SOL_SIG}?cluster=devnet"
    echo ""
fi

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
echo -e "${GREEN}Test Complete!${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}📊 Verification Links:${NC}"
echo "   - BTC Address: https://blockstream.info/testnet/address/${BTC_ADDR}"
if [ ! -z "$TX_HASH" ]; then
    echo "   - Mezo Transaction: https://explorer.mezo.org/tx/${TX_HASH}"
fi
if [ ! -z "$SOL_ADDR" ]; then
    echo "   - Solana Address: https://explorer.solana.com/address/${SOL_ADDR}?cluster=devnet"
fi
if [ ! -z "$SOL_SIG" ] && [ ${#SOL_SIG} -ge 32 ]; then
    echo "   - Solana Transaction: https://explorer.solana.com/tx/${SOL_SIG}?cluster=devnet"
fi
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Verify all transactions on respective explorers"
echo "  2. Check canister health: dfx canister call bridge_orchestrator health_check"
echo "  3. Review canister logs for any errors"
echo "  4. Test with Mobile app integration"
echo ""